package br.org.abrigo.animais.internal;

import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.animais.internal.domain.Animal;
import br.org.abrigo.animais.internal.domain.Cuidado;
import br.org.abrigo.animais.internal.domain.SituacaoVacinal;
import br.org.abrigo.animais.internal.domain.TipoCuidado;
import br.org.abrigo.animais.internal.domain.UltimasAplicacoes;
import br.org.abrigo.animais.internal.persistence.AnimalRepository;
import br.org.abrigo.animais.internal.persistence.CuidadoRepository;
import br.org.abrigo.plataforma.RecursoNaoEncontradoException;
import br.org.abrigo.plataforma.RegraNegocioException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Vacinas e vermífugo: registrar (um animal ou a ala inteira), histórico e pendências da home. */
@Service
@Transactional
public class GestaoCuidados {

    static final String SEM_ALA = "Sem ala";
    static final int MAXIMO_LOTE = 300;

    private final CuidadoRepository cuidados;
    private final AnimalRepository animais;
    private final Clock clock;

    GestaoCuidados(CuidadoRepository cuidados, AnimalRepository animais, Clock clock) {
        this.cuidados = cuidados;
        this.animais = animais;
        this.clock = clock;
    }

    public CuidadoResponse registrar(UUID animalId, TipoCuidado tipo, LocalDate aplicadoEm, LocalDate proximoEm,
                                     String observacao) {
        Animal animal = animais.findById(animalId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Animal", animalId));
        Cuidado c = Cuidado.registrar(animal, tipo, aplicadoEm, proximoEm, observacao, null, hoje());
        return paraResponse(cuidados.save(c));
    }

    /**
     * "Vermifuguei a Ala B hoje": um registro para cada animal, todos com o mesmo lote.
     * Tudo ou nada: se um animal não puder receber (adotado, óbito), nada é gravado e a mensagem diz quem.
     */
    public LoteResponse registrarEmLote(List<UUID> animalIds, TipoCuidado tipo, LocalDate aplicadoEm,
                                        LocalDate proximoEm, String observacao) {
        Set<UUID> ids = new LinkedHashSet<>(animalIds == null ? List.of() : animalIds);
        if (ids.isEmpty()) {
            throw new RegraNegocioException("Selecione ao menos um animal.");
        }
        if (ids.size() > MAXIMO_LOTE) {
            throw new RegraNegocioException("Máximo de " + MAXIMO_LOTE + " animais por registro.");
        }
        Map<UUID, Animal> encontrados = animais.findAllById(ids).stream()
                .collect(Collectors.toMap(Animal::getId, Function.identity()));
        if (encontrados.size() != ids.size()) {
            throw new RegraNegocioException("Algum animal selecionado não existe mais. Recarregue a lista.");
        }
        List<String> fora = encontrados.values().stream()
                .filter(a -> !a.estaSobCuidadoDaOng()).map(Animal::getNome).sorted().toList();
        if (!fora.isEmpty()) {
            throw new RegraNegocioException("Não estão mais sob cuidado da ONG: " + String.join(", ", fora) + ".");
        }
        UUID lote = UUID.randomUUID();
        LocalDate hoje = hoje();
        List<Cuidado> novos = ids.stream()
                .map(id -> Cuidado.registrar(encontrados.get(id), tipo, aplicadoEm, proximoEm, observacao, lote, hoje))
                .toList();
        cuidados.saveAll(novos);
        return new LoteResponse(lote, novos.size());
    }

    /** Corrigir um registro feito errado. */
    public void remover(UUID animalId, UUID cuidadoId) {
        Cuidado c = cuidados.findById(cuidadoId)
                .filter(x -> x.getAnimalId().equals(animalId))
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Registro de cuidado", cuidadoId));
        cuidados.delete(c);
    }

    @Transactional(readOnly = true)
    public List<CuidadoResponse> historico(UUID animalId) {
        if (!animais.existsById(animalId)) {
            throw RecursoNaoEncontradoException.de("Animal", animalId);
        }
        return cuidados.findByAnimalIdOrderByAplicadoEmDescCriadoEmDesc(animalId).stream()
                .map(GestaoCuidados::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public PendenciasVacinais pendencias(int diasAviso) {
        LocalDate hoje = hoje();
        List<Animal> sobCuidado = animais.findBySituacaoIn(List.of(SituacaoAnimal.DISPONIVEL, SituacaoAnimal.EM_TRATAMENTO));
        UltimasAplicacoes ultimas = new UltimasAplicacoes(cuidados.ultimasAplicacoes());
        List<TipoCuidado> vacinas = List.of(TipoCuidado.values()).stream().filter(TipoCuidado::ehVacina).toList();

        int vencidas = 0, vencendo = 0, semRegistro = 0, emDia = 0;
        Map<String, int[]> porAla = new TreeMap<>(); // [vencidas, vencendo, semRegistro, total]
        List<PendenciasVacinais.AnimalPendente> pendentes = new ArrayList<>();

        for (Animal a : sobCuidado) {
            SituacaoVacinal pior = SituacaoVacinal.EM_DIA;
            List<PendenciasVacinais.Vacina> detalhe = new ArrayList<>();
            for (TipoCuidado tipo : vacinas) {
                SituacaoVacinal s = ultimas.situacao(a.getId(), tipo, hoje, diasAviso);
                pior = SituacaoVacinal.pior(pior, s);
                var ultima = ultimas.ultima(a.getId(), tipo);
                detalhe.add(new PendenciasVacinais.Vacina(tipo,
                        ultima.map(Cuidado::getAplicadoEm).orElse(null),
                        ultima.map(Cuidado::getProximoEm).orElse(null), s));
            }
            int[] ala = porAla.computeIfAbsent(a.getAla() == null ? SEM_ALA : a.getAla(), k -> new int[4]);
            ala[3]++;
            switch (pior) {
                case VENCIDA -> { vencidas++; ala[0]++; }
                case VENCENDO -> { vencendo++; ala[1]++; }
                case SEM_REGISTRO -> { semRegistro++; ala[2]++; }
                case EM_DIA -> emDia++;
            }
            if (pior != SituacaoVacinal.EM_DIA) {
                pendentes.add(new PendenciasVacinais.AnimalPendente(a.getId(), a.getNome(), a.getChip(),
                        a.getAla(), a.getCanil(), pior, detalhe));
            }
        }

        // mais grave primeiro; dentro da mesma gravidade, quem venceu (ou vence) antes
        pendentes.sort(Comparator
                .comparing((PendenciasVacinais.AnimalPendente p) -> -p.situacao().gravidade())
                .thenComparing(GestaoCuidados::proximaDoseMaisCedo, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(PendenciasVacinais.AnimalPendente::nome));

        List<PendenciasVacinais.Ala> alas = porAla.entrySet().stream()
                .map(e -> new PendenciasVacinais.Ala(e.getKey(), e.getValue()[0], e.getValue()[1],
                        e.getValue()[2], e.getValue()[3]))
                .toList();
        return new PendenciasVacinais(hoje, diasAviso,
                new PendenciasVacinais.Totais(vencidas, vencendo, semRegistro, emDia), alas, pendentes);
    }

    private static LocalDate proximaDoseMaisCedo(PendenciasVacinais.AnimalPendente p) {
        return p.vacinas().stream().map(PendenciasVacinais.Vacina::proximoEm)
                .filter(java.util.Objects::nonNull).min(Comparator.naturalOrder()).orElse(null);
    }

    private static CuidadoResponse paraResponse(Cuidado c) {
        return new CuidadoResponse(c.getId(), c.getAnimalId(), c.getTipo(), c.getAplicadoEm(), c.getProximoEm(),
                c.getLoteId(), c.getObservacao(), c.getCriadoEm(), c.getCriadoPor());
    }

    private LocalDate hoje() {
        return LocalDate.now(clock);
    }
}
