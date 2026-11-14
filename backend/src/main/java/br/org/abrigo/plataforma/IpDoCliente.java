package br.org.abrigo.plataforma;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Único lugar que decide o IP de quem fez a requisição (usado no bloqueio de login e no antispam
 * do formulário público, ADR 0013).
 *
 * <p>Por que não usar o cabeçalho X-Forwarded-For direto: qualquer visitante pode mandar esse
 * cabeçalho com o IP que quiser. Ele só é confiável na parte que o proxy da hospedagem escreve,
 * e o comportamento do proxy do Railway precisa ser MEDIDO no deploy (docs/producao.md).
 * Por isso o modo é configurável ({@code IP_CLIENTE_MODO}):
 *
 * <ul>
 *   <li>{@code CONEXAO} (padrão): o IP da conexão TCP. Impossível de falsificar; atrás de um
 *   proxy, porém, todo mundo aparece com o IP do proxy.</li>
 *   <li>{@code X_FORWARDED_FOR_ULTIMO}: o último valor do cabeçalho, o que o proxy acrescentou.</li>
 *   <li>{@code X_FORWARDED_FOR_PRIMEIRO}: o primeiro valor; só se o proxy APAGA o que o
 *   visitante mandou e reescreve o cabeçalho.</li>
 *   <li>{@code X_REAL_IP}: o cabeçalho X-Real-IP, escrito pelo proxy.</li>
 * </ul>
 *
 * Se o cabeçalho escolhido não vier, ou vier com algo que não é IP, usa o IP da conexão.
 * Com {@code IP_CLIENTE_DIAGNOSTICO=true}, registra no log o que chegou (para a medição do deploy).
 */
@Component
public class IpDoCliente {

    public enum Modo { CONEXAO, X_FORWARDED_FOR_ULTIMO, X_FORWARDED_FOR_PRIMEIRO, X_REAL_IP }

    private static final Logger log = LoggerFactory.getLogger(IpDoCliente.class);
    /** IPv4 ou IPv6: só dígitos, letras a-f, ":" e ".". Qualquer outra coisa é descartada. */
    private static final Pattern PARECE_IP = Pattern.compile("[0-9a-fA-F:.]{2,45}");

    private final Modo modo;
    private final boolean diagnostico;

    public IpDoCliente(@Value("${abrigo.ip-cliente.modo:CONEXAO}") Modo modo,
                       @Value("${abrigo.ip-cliente.diagnostico:false}") boolean diagnostico) {
        this.modo = modo;
        this.diagnostico = diagnostico;
        log.info("IP do cliente: modo {}{}", modo, diagnostico ? " (diagnóstico ligado)" : "");
    }

    public String de(HttpServletRequest req) {
        String conexao = req.getRemoteAddr();
        String xff = req.getHeader("X-Forwarded-For");
        String xRealIp = req.getHeader("X-Real-IP");
        if (diagnostico) {
            log.info("Diagnóstico de IP em {}: conexão={} X-Forwarded-For={} X-Real-IP={}",
                    req.getRequestURI(), conexao, xff, xRealIp);
        }
        String escolhido = switch (modo) {
            case CONEXAO -> conexao;
            case X_FORWARDED_FOR_ULTIMO -> parte(xff, true);
            case X_FORWARDED_FOR_PRIMEIRO -> parte(xff, false);
            case X_REAL_IP -> xRealIp == null ? null : xRealIp.trim();
        };
        return escolhido != null && PARECE_IP.matcher(escolhido).matches() ? escolhido : conexao;
    }

    private static String parte(String cabecalho, boolean ultimo) {
        if (cabecalho == null || cabecalho.isBlank()) {
            return null;
        }
        String[] partes = cabecalho.split(",");
        return partes[ultimo ? partes.length - 1 : 0].trim();
    }
}
