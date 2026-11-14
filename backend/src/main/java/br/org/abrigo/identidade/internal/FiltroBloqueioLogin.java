package br.org.abrigo.identidade.internal;

import br.org.abrigo.plataforma.IpDoCliente;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Roda antes do login do Spring. Se o e-mail estiver bloqueado naquele IP (ou o IP inteiro, ou a
 * conta passou do limite de erros recentes), responde 401 sem nem conferir a senha: a mesma
 * resposta de uma senha errada (ADR 0013).
 *
 * <p>Tempo de resposta igual: recusar um bloqueado é mais rápido que conferir uma senha errada
 * (o teste de homologação mediu ~66 ms contra ~78 ms), e pela diferença daria para perceber o
 * bloqueio. Por isso toda recusa de login (bloqueio aqui, senha errada no SegurancaConfig) só
 * responde depois de um tempo mínimo fixo. De quebra, cada chute de um robô fica mais lento.
 */
class FiltroBloqueioLogin extends OncePerRequestFilter {

    static final String ROTA_LOGIN = "/api/auth/login";
    /** Bem acima do tempo normal de uma senha errada, para cobrir a variação do banco. */
    static final Duration TEMPO_MINIMO_RECUSA = Duration.ofMillis(400);
    private static final String INICIO = FiltroBloqueioLogin.class.getName() + ".inicio";

    private final ProtecaoLogin protecao;
    private final IpDoCliente ipDoCliente;

    FiltroBloqueioLogin(ProtecaoLogin protecao, IpDoCliente ipDoCliente) {
        this.protecao = protecao;
        this.ipDoCliente = ipDoCliente;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String caminho = req.getRequestURI().substring(req.getContextPath().length());
        return !("POST".equals(req.getMethod()) && ROTA_LOGIN.equals(caminho));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain cadeia)
            throws ServletException, IOException {
        req.setAttribute(INICIO, System.nanoTime());
        if (protecao.estaBloqueado(req.getParameter("username"), ipDoCliente.de(req))) {
            esperarTempoMinimo(req);
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        cadeia.doFilter(req, res);
    }

    /** Segura a resposta até completar o tempo mínimo desde que o login chegou. */
    static void esperarTempoMinimo(HttpServletRequest req) {
        if (!(req.getAttribute(INICIO) instanceof Long inicio)) {
            return;
        }
        long restante = TEMPO_MINIMO_RECUSA.toNanos() - (System.nanoTime() - inicio);
        if (restante > 0) {
            try {
                Thread.sleep(Duration.ofNanos(restante));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
