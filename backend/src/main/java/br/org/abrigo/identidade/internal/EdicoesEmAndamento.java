package br.org.abrigo.identidade.internal;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Quem está com um cadastro aberto para edição agora ("aviso de presença", ADR 0014).
 *
 * <p>Não é trava: ninguém é impedido de editar. Serve para avisar "Maria está editando desde 10:42",
 * no espírito do aviso de remessa em processamento do SAP, mas sem o problema da trava esquecida
 * (celular que apaga no bolso). A tela manda um sinal a cada 30 s; sem sinal por 2 minutos, a
 * presença some sozinha. Quem garante que ninguém apaga a alteração do outro continua sendo o
 * bloqueio otimista (versão + 409).
 *
 * <p>Em memória: se o servidor reiniciar, os avisos somem (e voltam no próximo sinal). Para um
 * aviso isso basta; com várias instâncias, passaria para o banco.
 */
@Component
public class EdicoesEmAndamento {

    static final Duration VALIDADE = Duration.ofMinutes(2);

    /** Quem mais está editando, para a tela mostrar. */
    public record Editor(String nome, Instant desde) {
    }

    private record Presenca(String email, String nome, Instant desde, Instant ultimoSinal) {
    }

    private final Clock clock;
    /** chave do cadastro ("animal:uuid") → e-mail → presença */
    private final Map<String, Map<String, Presenca>> porCadastro = new ConcurrentHashMap<>();

    EdicoesEmAndamento(Clock clock) {
        this.clock = clock;
    }

    /** "Continuo aqui": registra ou renova a presença e devolve os OUTROS que estão editando. */
    public List<Editor> sinalizar(String chave, String email, String nome) {
        Instant agora = Instant.now(clock);
        limparVencidos(agora);
        Map<String, Presenca> editores = porCadastro.computeIfAbsent(chave, k -> new ConcurrentHashMap<>());
        editores.compute(email, (e, atual) -> new Presenca(email, nome, atual == null ? agora : atual.desde(), agora));
        return editores.values().stream()
                .filter(p -> !p.email().equals(email))
                .sorted(Comparator.comparing(Presenca::desde))
                .map(p -> new Editor(p.nome(), p.desde()))
                .toList();
    }

    /** Saiu da tela (salvou, cancelou, fechou ou escolheu só visualizar). */
    public void sair(String chave, String email) {
        Map<String, Presenca> editores = porCadastro.get(chave);
        if (editores != null) {
            editores.remove(email);
            porCadastro.remove(chave, Map.of());
        }
    }

    private void limparVencidos(Instant agora) {
        porCadastro.values().forEach(editores ->
                editores.values().removeIf(p -> p.ultimoSinal().plus(VALIDADE).isBefore(agora)));
        porCadastro.values().removeIf(Map::isEmpty);
    }
}
