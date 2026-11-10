package br.org.abrigo.identidade.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/**
 * Proteção do login contra força bruta (ADR 0013, RN-67). Tudo fica no banco e é permanente:
 *
 * <ul>
 *   <li><b>5 senhas erradas seguidas</b> no mesmo e-mail, vindas do mesmo IP → aquele e-mail fica
 *   bloqueado naquele IP. A dona da conta, em outra rede, continua entrando: assim ninguém tranca
 *   uma conta (nem a do administrador) só por saber o e-mail.</li>
 *   <li>Um IP que erra senha em <b>3 e-mails diferentes</b> dentro de 1 hora → o IP inteiro fica
 *   bloqueado. Errar vários e-mails é assinatura de robô, não de quem esqueceu a própria senha.</li>
 *   <li>Login certo apaga as senhas erradas daquele par (o contador é de erros <i>seguidos</i>).</li>
 *   <li><b>Rede de segurança que não depende de IP</b>: 10 senhas erradas na mesma conta em 15 minutos,
 *   vindas de qualquer lugar, fazem a conta recusar tudo até a janela passar. É temporário de
 *   propósito: permanente, deixaria qualquer um trancar a conta do administrador de fora. Cobre o
 *   caso de o IP não ser confiável (robô inventando um IP a cada tentativa).</li>
 * </ul>
 *
 * Quem está bloqueado recebe exatamente a mesma resposta de uma senha errada, inclusive com a senha
 * certa: o atacante não descobre se o e-mail existe, se acertou ou se foi bloqueado.
 */
@Service
@Transactional
public class ProtecaoLogin {

    private static final Logger log = LoggerFactory.getLogger(ProtecaoLogin.class);
    /** Senhas erradas antigas deixam de contar (e são apagadas) depois disso. */
    private static final Duration GUARDA_TENTATIVAS = Duration.ofDays(30);

    private final JdbcClient jdbc;
    private final Clock clock;
    private final int errosPorEmail;
    private final int emailsPorIp;
    private final Duration janelaEmailsPorIp;
    private final int errosPorConta;
    private final Duration janelaErrosPorConta;

    ProtecaoLogin(JdbcClient jdbc, Clock clock,
                  @Value("${abrigo.login.erros-por-email:5}") int errosPorEmail,
                  @Value("${abrigo.login.emails-por-ip:3}") int emailsPorIp,
                  @Value("${abrigo.login.janela-emails-por-ip:1h}") Duration janelaEmailsPorIp,
                  @Value("${abrigo.login.erros-por-conta:10}") int errosPorConta,
                  @Value("${abrigo.login.janela-erros-por-conta:15m}") Duration janelaErrosPorConta) {
        this.jdbc = jdbc;
        this.clock = clock;
        this.errosPorEmail = errosPorEmail;
        this.emailsPorIp = emailsPorIp;
        this.janelaEmailsPorIp = janelaEmailsPorIp;
        this.errosPorConta = errosPorConta;
        this.janelaErrosPorConta = janelaErrosPorConta;
    }

    /**
     * Recusar este login sem nem conferir a senha? Sim se o IP está bloqueado por inteiro, se o
     * e-mail está bloqueado neste IP, ou se a conta passou do limite de erros recentes (de qualquer IP).
     */
    @Transactional(readOnly = true)
    public boolean estaBloqueado(String email, String ip) {
        String e = normalizar(email);
        boolean bloqueioPermanente = jdbc.sql("""
                        select count(*) from bloqueio_login
                         where ip = :ip and (email is null or email = :email)""")
                .param("ip", ip)
                .param("email", e)
                .query(Long.class).single() > 0;
        return bloqueioPermanente || errosRecentesDaConta(e, agora()) >= errosPorConta;
    }

    /** Senha errada (ou usuário inexistente/desativado): conta e, se for o caso, bloqueia. */
    public void registrarFalha(String email, String ip) {
        String e = normalizar(email);
        OffsetDateTime agora = agora();

        jdbc.sql("delete from tentativa_login where em < :limite")
                .param("limite", agora.minus(GUARDA_TENTATIVAS)).update();
        jdbc.sql("insert into tentativa_login (email, ip, em) values (:email, :ip, :em)")
                .param("email", e).param("ip", ip).param("em", agora).update();

        long errosDoPar = jdbc.sql("select count(*) from tentativa_login where email = :email and ip = :ip")
                .param("email", e).param("ip", ip).query(Long.class).single();
        if (errosDoPar >= errosPorEmail && bloquear(ip, e, "SENHAS_ERRADAS", agora)) {
            log.warn("Login bloqueado: e-mail {} no IP {} após {} senhas erradas seguidas", mascarar(e), ip, errosDoPar);
        }

        long emailsDoIp = jdbc.sql("select count(distinct email) from tentativa_login where ip = :ip and em >= :desde")
                .param("ip", ip).param("desde", agora.minus(janelaEmailsPorIp)).query(Long.class).single();
        if (emailsDoIp >= emailsPorIp && bloquear(ip, null, "VARIOS_EMAILS", agora)) {
            log.warn("IP {} bloqueado por inteiro: errou senha em {} e-mails diferentes", ip, emailsDoIp);
        }
        if (errosRecentesDaConta(e, agora) == errosPorConta) {
            log.warn("Conta {} recusando logins por {}: {} senhas erradas, vindas de qualquer IP",
                    mascarar(e), janelaErrosPorConta, errosPorConta);
        }
        log.info("Senha errada para {} vinda do IP {}", mascarar(e), ip);
    }

    /** Login certo: zera os erros seguidos daquele e-mail naquele IP. */
    public void registrarSucesso(String email, String ip) {
        jdbc.sql("delete from tentativa_login where email = :email and ip = :ip")
                .param("email", normalizar(email)).param("ip", ip).update();
    }

    /** Dos e-mails informados, quais têm algum bloqueio (em qualquer IP). */
    @Transactional(readOnly = true)
    public Set<String> comBloqueio(Collection<String> emails) {
        if (emails.isEmpty()) {
            return Set.of();
        }
        return new HashSet<>(jdbc.sql("select distinct email from bloqueio_login where email in (:emails)")
                .param("emails", emails.stream().map(ProtecaoLogin::normalizar).toList())
                .query(String.class).list());
    }

    /** Libera o e-mail em todos os IPs e zera os erros dele. IPs bloqueados por inteiro continuam. */
    public void desbloquear(String email) {
        String e = normalizar(email);
        jdbc.sql("delete from bloqueio_login where email = :email").param("email", e).update();
        jdbc.sql("delete from tentativa_login where email = :email").param("email", e).update();
        log.warn("Acesso de {} desbloqueado pelo administrador", mascarar(e));
    }

    // ------------------------------------------------------------------ apoio

    private long errosRecentesDaConta(String email, OffsetDateTime agora) {
        return jdbc.sql("select count(*) from tentativa_login where email = :email and em >= :desde")
                .param("email", email).param("desde", agora.minus(janelaErrosPorConta))
                .query(Long.class).single();
    }

    private OffsetDateTime agora() {
        return OffsetDateTime.now(clock).withOffsetSameInstant(ZoneOffset.UTC);
    }

    /** @return true se criou agora (false se já existia). */
    private boolean bloquear(String ip, String email, String motivo, OffsetDateTime agora) {
        return jdbc.sql("""
                        insert into bloqueio_login (ip, email, motivo, bloqueado_em)
                        values (:ip, :email, :motivo, :em)
                        on conflict do nothing""")
                .param("ip", ip).param("email", email).param("motivo", motivo).param("em", agora)
                .update() > 0;
    }

    static String normalizar(String email) {
        String e = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        return e.length() > 200 ? e.substring(0, 200) : e;
    }

    /** Para o log não espalhar dado pessoal (LGPD): "abrigo@gmail.com" → "ab***@gmail.com". */
    static String mascarar(String email) {
        int arroba = email.indexOf('@');
        String nome = arroba < 0 ? email : email.substring(0, arroba);
        String dominio = arroba < 0 ? "" : email.substring(arroba);
        return nome.substring(0, Math.min(2, nome.length())) + "***" + dominio;
    }
}
