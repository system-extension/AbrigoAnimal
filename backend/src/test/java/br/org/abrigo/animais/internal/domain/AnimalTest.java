package br.org.abrigo.animais.internal.domain;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.plataforma.RegraNegocioException;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Regras do Animal testadas SEM Spring e SEM banco: rápidos e baratos. */
class AnimalTest {

    static final LocalDate HOJE = LocalDate.of(2026, 10, 1);
    static final Instant AGORA = Instant.parse("2026-10-01T12:00:00Z");

    static DadosAnimal dados(String nome) {
        return dados(nome, "963003002248049", null, List.of("Dócil"));
    }

    static DadosAnimal dados(String nome, String chip, String chipAdicional, List<String> temperamento) {
        return new DadosAnimal(nome, Especie.CAO, Sexo.MACHO, "caramelo", Porte.MEDIO, LocalDate.of(2014, 5, 1),
                null, chip, chipAdicional, "A", "14A", true, "Dócil", temperamento, "Remédio X", null);
    }

    @Test
    void cadastroNasceDisponivelVisivelEComSlug() {
        Animal a = Animal.cadastrar(dados("Thor Júnior"));

        assertThat(a.getSituacao()).isEqualTo(SituacaoAnimal.DISPONIVEL);
        assertThat(a.estaNaVitrine()).isTrue();
        assertThat(a.getSlug()).startsWith("thor-junior-").hasSize("thor-junior-".length() + 6);
    }

    @Test
    void nomeEhObrigatorio() {
        assertThatThrownBy(() -> Animal.cadastrar(dados("  ")))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void slugNaoMudaQuandoONomeMuda() {
        Animal a = Animal.cadastrar(dados("Thor"));
        String slug = a.getSlug();

        a.atualizar(dados("Thor Segundo"));

        assertThat(a.getSlug()).isEqualTo(slug);
    }

    @Test
    void obitoTiraDaVitrineEEhEstadoFinal() {
        Animal a = Animal.cadastrar(dados("Mel"));

        a.registrarObito(HOJE, HOJE);

        assertThat(a.estaNaVitrine()).isFalse();
        assertThat(a.podeSerApadrinhado()).isFalse();
        assertThatThrownBy(() -> a.alterarSituacao(SituacaoAnimal.DISPONIVEL))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(a::publicarNaVitrine).isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void obitoNaoPodeTerDataFutura() {
        Animal a = Animal.cadastrar(dados("Mel"));

        assertThatThrownBy(() -> a.registrarObito(HOJE.plusDays(1), HOJE))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void obitoNaoEntraPorAlterarSituacao() {
        Animal a = Animal.cadastrar(dados("Mel"));

        assertThatThrownBy(() -> a.alterarSituacao(SituacaoAnimal.OBITO))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void primeiraFotoViraPrincipalERemoverPrincipalPromoveAProxima() {
        Animal a = Animal.cadastrar(dados("Bob"));
        FotoAnimal f1 = a.adicionarFoto("animais/x/1.jpg", AGORA);
        FotoAnimal f2 = a.adicionarFoto("animais/x/2.jpg", AGORA);

        assertThat(f1.isPrincipal()).isTrue();
        assertThat(f2.isPrincipal()).isFalse();

        String chaveRemovida = a.removerFoto(f1.getId());

        assertThat(chaveRemovida).isEqualTo("animais/x/1.jpg");
        assertThat(a.fotoPrincipal()).contains(f2);
    }

    @Test
    void limiteDeFotos() {
        Animal a = Animal.cadastrar(dados("Bob"));
        for (int i = 0; i < Animal.MAXIMO_FOTOS; i++) {
            a.adicionarFoto("k" + i, AGORA);
        }
        assertThatThrownBy(() -> a.adicionarFoto("extra", AGORA))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void idadeCalculadaPelaDataEstimada() {
        Animal a = Animal.cadastrar(dados("Bob"));

        assertThat(a.idadeEmAnos(HOJE)).isEqualTo(12);
    }

    @Test
    void castradoNaoInformadoContinuaNulo() {
        // a planilha da ONG não tem essa coluna: "false" afirmaria algo que ninguém sabe
        assertThat(Animal.cadastrar(dados("Bob")).getCastrado()).isNull();
    }

    @Test
    void medicacaoPreenchidaSignificaMedicacaoContinua() {
        assertThat(Animal.cadastrar(dados("Bob")).usaMedicacaoContinua()).isTrue();
    }

    @Test
    void chipPerdeEspacosDigitados() {
        Animal a = Animal.cadastrar(dados("Celi", " 982000 357845912 ", "966000101128234", List.of()));

        assertThat(a.getChip()).isEqualTo("982000357845912");
        assertThat(a.getChipAdicional()).isEqualTo("966000101128234");
    }

    @Test
    void chipAdicionalIgualAoPrincipalEhRecusado() {
        assertThatThrownBy(() -> Animal.cadastrar(dados("Celi", "123", "123", List.of())))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void chipAdicionalSemPrincipalViraOPrincipal() {
        Animal a = Animal.cadastrar(dados("Celi", null, "966000101128234", List.of()));

        assertThat(a.getChip()).isEqualTo("966000101128234");
        assertThat(a.getChipAdicional()).isNull();
    }

    @Test
    void temperamentoSemRepeticaoEComLimite() {
        Animal a = Animal.cadastrar(dados("Bob", null, null, List.of("Dócil", " Dócil ", "Calmo", " ")));
        assertThat(a.getTemperamento()).containsExactly("Dócil", "Calmo");

        List<String> demais = List.of("a", "b", "c", "d", "e", "f", "g", "h", "i");
        assertThatThrownBy(() -> Animal.cadastrar(dados("Bob", null, null, demais)))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void soQuemEstaNoAbrigoRecebeCuidados() {
        Animal a = Animal.cadastrar(dados("Bob"));
        assertThat(a.estaSobCuidadoDaOng()).isTrue();

        a.alterarSituacao(SituacaoAnimal.ADOTADO);
        assertThat(a.estaSobCuidadoDaOng()).isFalse();
    }
}
