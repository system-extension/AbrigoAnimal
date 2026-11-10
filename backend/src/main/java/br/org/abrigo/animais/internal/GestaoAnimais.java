package br.org.abrigo.animais.internal;

import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.animais.internal.domain.Animal;
import br.org.abrigo.animais.internal.domain.DadosAnimal;
import br.org.abrigo.animais.internal.persistence.AnimalRepository;
import br.org.abrigo.animais.internal.persistence.EspecificacoesAnimal;
import br.org.abrigo.animais.internal.persistence.EspecificacoesAnimal.FiltroAnimais;
import br.org.abrigo.plataforma.ArmazenamentoArquivos;
import br.org.abrigo.plataforma.Pagina;
import br.org.abrigo.plataforma.RecursoNaoEncontradoException;
import br.org.abrigo.plataforma.RegraNegocioException;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/**
 * Casos de uso da equipe sobre animais. "Orquestra": carrega, chama a regra na entidade,
 * cuida da transação e dos arquivos. As regras em si estão em Animal.
 */
@Service
@Transactional
public class GestaoAnimais {

    static final long TAMANHO_MAXIMO_FOTO = 3L * 1024 * 1024; // 3 MB (a foto já chega comprimida pelo celular)

    private final AnimalRepository animais;
    private final MapeadorAnimal mapeador;
    private final ArmazenamentoArquivos armazenamento;
    private final Clock clock;

    GestaoAnimais(AnimalRepository animais, MapeadorAnimal mapeador,
                  ArmazenamentoArquivos armazenamento, Clock clock) {
        this.animais = animais;
        this.mapeador = mapeador;
        this.armazenamento = armazenamento;
        this.clock = clock;
    }

    public AnimalDetalhe cadastrar(DadosAnimal dados) {
        validarChipsUnicos(dados, null);
        Animal animal = animais.save(Animal.cadastrar(dados));
        return responder(animal);
    }

    /**
     * @param versaoEsperada versão que a tela carregou. Se alguém salvou antes, 409
     *                       (evita que uma edição apague a outra sem ninguém perceber).
     */
    public AnimalDetalhe atualizar(UUID id, DadosAnimal dados, Long versaoEsperada) {
        Animal animal = carregar(id);
        if (versaoEsperada != null && !Objects.equals(versaoEsperada, animal.getVersao())) {
            throw new ObjectOptimisticLockingFailureException(Animal.class, id);
        }
        validarChipsUnicos(dados, id);
        animal.atualizar(dados);
        return responder(animal);
    }

    @Transactional(readOnly = true)
    public AnimalDetalhe buscar(UUID id) {
        return mapeador.paraDetalhe(carregar(id));
    }

    @Transactional(readOnly = true)
    public Pagina<AnimalListagem> listar(FiltroAnimais filtro, Pageable pageable) {
        return Pagina.de(animais.findAll(EspecificacoesAnimal.daGestao(filtro), pageable)
                .map(mapeador::paraListagem));
    }

    public AnimalDetalhe alterarSituacao(UUID id, SituacaoAnimal nova) {
        Animal animal = carregar(id);
        animal.alterarSituacao(nova);
        return responder(animal);
    }

    public AnimalDetalhe registrarObito(UUID id, LocalDate data) {
        Animal animal = carregar(id);
        animal.registrarObito(data, LocalDate.now(clock));
        return responder(animal);
    }

    public AnimalDetalhe alterarVisibilidade(UUID id, boolean visivel) {
        Animal animal = carregar(id);
        if (visivel) {
            animal.publicarNaVitrine();
        } else {
            animal.ocultarDaVitrine();
        }
        return responder(animal);
    }

    public AnimalDetalhe adicionarFoto(UUID id, MultipartFile arquivo) {
        Animal animal = carregar(id);
        byte[] conteudo = lerImagemValida(arquivo);
        String extensao = TipoImagem.detectar(conteudo)
                .orElseThrow(() -> new RegraNegocioException("Formato não suportado. Envie JPG, PNG ou WEBP."))
                .extensao();
        String chave = armazenamento.salvar("animais/" + id, extensao, conteudo);
        try {
            animal.adicionarFoto(chave, Instant.now(clock));
        } catch (RuntimeException e) {
            armazenamento.remover(chave); // não deixa arquivo órfão se a regra recusar
            throw e;
        }
        removerArquivoSeTransacaoFalhar(chave);
        return responder(animal);
    }

    public AnimalDetalhe removerFoto(UUID id, UUID fotoId) {
        Animal animal = carregar(id);
        String chave = animal.removerFoto(fotoId);
        removerArquivoAposCommit(chave);
        return responder(animal);
    }

    public AnimalDetalhe definirFotoPrincipal(UUID id, UUID fotoId) {
        Animal animal = carregar(id);
        animal.definirFotoPrincipal(fotoId);
        return responder(animal);
    }

    // ------------------------------------------------------------------ apoio

    /**
     * Grava as alterações no banco ANTES de montar a resposta. Sem o flush, a versão e o
     * "alterado por/em" só mudariam no commit, depois da resposta pronta: a tela receberia
     * a versão antiga e o próximo "Salvar" daria um falso 409 (RN-12).
     */
    private AnimalDetalhe responder(Animal animal) {
        animais.flush();
        return mapeador.paraDetalhe(animal);
    }

    private Animal carregar(UUID id) {
        return animais.findById(id).orElseThrow(() -> RecursoNaoEncontradoException.de("Animal", id));
    }

    /** Nenhum dos dois chips pode existir em OUTRO animal, em nenhum dos dois campos. */
    private void validarChipsUnicos(DadosAnimal dados, UUID idAtual) {
        for (String bruto : new String[] {dados.chip(), dados.chipAdicional()}) {
            String chip = Animal.limparChip(bruto);
            if (chip == null) {
                continue;
            }
            animais.buscarPorChip(chip).stream()
                    .filter(outro -> !outro.getId().equals(idAtual))
                    .findFirst()
                    .ifPresent(outro -> {
                        throw new RegraNegocioException("O chip " + chip + " já está no cadastro de "
                                + outro.getNome() + ".");
                    });
        }
    }

    private static byte[] lerImagemValida(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RegraNegocioException("Envie uma imagem.");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO_FOTO) {
            throw new RegraNegocioException("A imagem passa de 3 MB. Ela deveria ter sido comprimida no celular.");
        }
        try {
            return arquivo.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao ler a imagem enviada", e);
        }
    }

    /** O arquivo só é apagado de verdade se o banco confirmar a remoção (commit). */
    private void removerArquivoAposCommit(String chave) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                armazenamento.remover(chave);
            }
        });
    }

    /** Se a transação desfizer a inclusão da foto, o arquivo gravado é apagado. */
    private void removerArquivoSeTransacaoFalhar(String chave) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    armazenamento.remover(chave);
                }
            }
        });
    }
}
