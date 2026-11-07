package br.org.abrigo.animais;

import br.org.abrigo.animais.internal.MapeadorAnimal;
import br.org.abrigo.animais.internal.domain.Animal;
import br.org.abrigo.animais.internal.domain.UltimasAplicacoes;
import br.org.abrigo.animais.internal.persistence.AnimalRepository;
import br.org.abrigo.animais.internal.persistence.CuidadoRepository;
import br.org.abrigo.animais.internal.persistence.EspecificacoesAnimal;
import br.org.abrigo.plataforma.Pagina;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * API PÚBLICA do módulo: o que os outros módulos podem pedir aos animais.
 * Só devolve records (AnimalResumo, AnimalVitrine), nunca a entidade interna.
 *
 * <p>Os casos de uso da equipe (cadastrar, editar, fotos...) ficam em internal/GestaoAnimais,
 * invisíveis para outros módulos.
 */
@Service
@Transactional(readOnly = true)
public class AnimalService {

    private final AnimalRepository animais;
    private final CuidadoRepository cuidados;
    private final MapeadorAnimal mapeador;
    private final Clock clock;

    public AnimalService(AnimalRepository animais, CuidadoRepository cuidados, MapeadorAnimal mapeador, Clock clock) {
        this.animais = animais;
        this.cuidados = cuidados;
        this.mapeador = mapeador;
        this.clock = clock;
    }

    public Optional<AnimalResumo> buscarResumo(UUID id) {
        return animais.findById(id).map(mapeador::paraResumo);
    }

    /** Resolve o slug da URL pública para o animal (só se ele estiver visível na vitrine). */
    public Optional<AnimalResumo> buscarResumoNaVitrine(String slug) {
        return animais.findBySlug(slug)
                .filter(a -> a.estaNaVitrine())
                .map(mapeador::paraResumo);
    }

    public Pagina<AnimalVitrine> listarVitrine(Especie especie, Sexo sexo, Porte porte, Boolean idoso,
                                               Pageable pageable) {
        var pagina = animais.findAll(EspecificacoesAnimal.daVitrine(especie, sexo, porte, idoso), pageable);
        // uma consulta só para as vacinas da página inteira (evita N+1)
        var vacinas = ultimasAplicacoes(pagina.getContent().stream().map(Animal::getId).toList());
        LocalDate hoje = LocalDate.now(clock);
        return Pagina.de(pagina.map(a -> mapeador.paraVitrine(a, vacinas.vacinasEmDia(a.getId(), hoje))));
    }

    public Optional<AnimalVitrine> buscarVitrinePorSlug(String slug) {
        return animais.findBySlug(slug)
                .filter(a -> a.estaNaVitrine())
                .map(a -> mapeador.paraVitrine(a,
                        ultimasAplicacoes(List.of(a.getId())).vacinasEmDia(a.getId(), LocalDate.now(clock))));
    }

    private UltimasAplicacoes ultimasAplicacoes(List<UUID> ids) {
        return new UltimasAplicacoes(ids.isEmpty() ? List.of() : cuidados.ultimasAplicacoes(ids));
    }
}
