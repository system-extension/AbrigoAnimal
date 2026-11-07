package br.org.abrigo.animais.internal.domain;

import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.plataforma.RegraNegocioException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Regras de vacina/vermífugo, sem Spring e sem banco. Casos tirados das planilhas da ONG. */
class CuidadoTest {

    static final LocalDate HOJE = LocalDate.of(2026, 10, 26);

    static Animal animal() {
        return Animal.cadastrar(AnimalTest.dados("Biscoito"));
    }

    @Test
    void vacinaSugereProximaDoseEmUmAno() {
        Cuidado c = Cuidado.registrar(animal(), TipoCuidado.V8, LocalDate.of(2025, 12, 29), null, null, null, HOJE);

        assertThat(c.getProximoEm()).isEqualTo(LocalDate.of(2026, 12, 29));
    }

    @Test
    void proximaDoseInformadaVence() {
        // reforço de filhote: 21 dias (exceção que aparece na planilha da Ala C)
        LocalDate aplicada = LocalDate.of(2026, 9, 1);
        Cuidado c = Cuidado.registrar(animal(), TipoCuidado.V8, aplicada, aplicada.plusDays(21), "1ª dose", null, HOJE);

        assertThat(c.getProximoEm()).isEqualTo(LocalDate.of(2026, 9, 22));
        assertThat(c.getObservacao()).isEqualTo("1ª dose");
    }

    @Test
    void vermifugoNaoTemPadraoAinda() {
        Cuidado c = Cuidado.registrar(animal(), TipoCuidado.VERMIFUGO, LocalDate.of(2026, 10, 5), null, null, null, HOJE);

        assertThat(c.getProximoEm()).isNull();
    }

    @Test
    void dataFuturaEhRecusada() {
        assertThatThrownBy(() -> Cuidado.registrar(animal(), TipoCuidado.RAIVA, HOJE.plusDays(1), null, null, null, HOJE))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void proximaDoseAntesDaAplicacaoEhRecusada() {
        assertThatThrownBy(() -> Cuidado.registrar(animal(), TipoCuidado.RAIVA, HOJE, HOJE, null, null, HOJE))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void animalAdotadoNaoRecebe() {
        Animal a = animal();
        a.alterarSituacao(SituacaoAnimal.ADOTADO);

        assertThatThrownBy(() -> Cuidado.registrar(a, TipoCuidado.V8, HOJE, null, null, null, HOJE))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("Biscoito");
    }

    @Test
    void situacaoPelaProximaDose() {
        assertThat(SituacaoVacinal.de(HOJE.minusDays(1), HOJE, 30)).isEqualTo(SituacaoVacinal.VENCIDA);
        assertThat(SituacaoVacinal.de(HOJE, HOJE, 30)).isEqualTo(SituacaoVacinal.VENCENDO);
        assertThat(SituacaoVacinal.de(HOJE.plusDays(30), HOJE, 30)).isEqualTo(SituacaoVacinal.VENCENDO);
        assertThat(SituacaoVacinal.de(HOJE.plusDays(31), HOJE, 30)).isEqualTo(SituacaoVacinal.EM_DIA);
        assertThat(SituacaoVacinal.de(null, HOJE, 30)).isEqualTo(SituacaoVacinal.EM_DIA);
    }

    @Test
    void vitrineSoAfirmaVacinasEmDiaComV8ERaiva() {
        Animal a = animal();
        UUID id = a.getId();
        LocalDate aplicada = HOJE.minusMonths(2);
        Cuidado v8 = Cuidado.registrar(a, TipoCuidado.V8, aplicada, null, null, null, HOJE);
        Cuidado raiva = Cuidado.registrar(a, TipoCuidado.RAIVA, aplicada, null, null, null, HOJE);
        Cuidado raivaVencida = Cuidado.registrar(a, TipoCuidado.RAIVA, HOJE.minusYears(2), null, null, null, HOJE);

        assertThat(new UltimasAplicacoes(List.of()).vacinasEmDia(id, HOJE)).isNull();
        assertThat(new UltimasAplicacoes(List.of(v8)).vacinasEmDia(id, HOJE)).isNull();
        assertThat(new UltimasAplicacoes(List.of(v8, raiva)).vacinasEmDia(id, HOJE)).isTrue();
        assertThat(new UltimasAplicacoes(List.of(v8, raivaVencida)).vacinasEmDia(id, HOJE)).isFalse();
    }

    @Test
    void ultimaAplicacaoEhAMaisRecente() {
        Animal a = animal();
        Cuidado antiga = Cuidado.registrar(a, TipoCuidado.V8, HOJE.minusYears(2), null, null, null, HOJE);
        Cuidado nova = Cuidado.registrar(a, TipoCuidado.V8, HOJE.minusDays(3), null, null, null, HOJE);

        assertThat(new UltimasAplicacoes(List.of(nova, antiga)).ultima(a.getId(), TipoCuidado.V8)).contains(nova);
        assertThat(new UltimasAplicacoes(List.of(antiga, nova)).ultima(a.getId(), TipoCuidado.V8)).contains(nova);
    }
}
