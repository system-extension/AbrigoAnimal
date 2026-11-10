package br.org.abrigo.identidade.internal;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class EdicoesEmAndamentoTest {

    /** Relógio que o teste adianta à vontade. */
    private static final class Relogio extends Clock {
        private Instant agora = Instant.parse("2026-11-09T13:00:00Z");

        void avancar(Duration d) {
            agora = agora.plus(d);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return agora;
        }
    }

    private final Relogio relogio = new Relogio();
    private final EdicoesEmAndamento edicoes = new EdicoesEmAndamento(relogio);

    @Test
    void mostraQuemMaisEstaEditandoDesdeQuando() {
        assertThat(edicoes.sinalizar("animal:1", "maria@x", "Maria")).isEmpty();
        relogio.avancar(Duration.ofSeconds(40));

        var outros = edicoes.sinalizar("animal:1", "joao@x", "João");

        assertThat(outros).hasSize(1);
        assertThat(outros.getFirst().nome()).isEqualTo("Maria");
        assertThat(outros.getFirst().desde()).isEqualTo(Instant.parse("2026-11-09T13:00:00Z"));
    }

    @Test
    void cadastrosDiferentesNaoSeMisturam() {
        edicoes.sinalizar("animal:1", "maria@x", "Maria");
        assertThat(edicoes.sinalizar("animal:2", "joao@x", "João")).isEmpty();
    }

    @Test
    void semSinalPorDoisMinutosAPresencaSome() {
        edicoes.sinalizar("animal:1", "maria@x", "Maria"); // e o celular dela apagou no bolso
        relogio.avancar(Duration.ofMinutes(2).plusSeconds(1));

        assertThat(edicoes.sinalizar("animal:1", "joao@x", "João")).isEmpty();
    }

    @Test
    void sinalRenovaMasMantemODesde() {
        edicoes.sinalizar("animal:1", "maria@x", "Maria");
        for (int i = 0; i < 6; i++) { // 3 minutos mandando sinal a cada 30 s
            relogio.avancar(Duration.ofSeconds(30));
            edicoes.sinalizar("animal:1", "maria@x", "Maria");
        }

        var outros = edicoes.sinalizar("animal:1", "joao@x", "João");
        assertThat(outros).extracting(EdicoesEmAndamento.Editor::desde)
                .containsExactly(Instant.parse("2026-11-09T13:00:00Z"));
    }

    @Test
    void sairTiraNaHora() {
        edicoes.sinalizar("animal:1", "maria@x", "Maria");
        edicoes.sair("animal:1", "maria@x");

        assertThat(edicoes.sinalizar("animal:1", "joao@x", "João")).isEmpty();
    }
}
