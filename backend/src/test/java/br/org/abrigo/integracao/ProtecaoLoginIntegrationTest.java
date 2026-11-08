package br.org.abrigo.integracao;

import br.org.abrigo.suporte.IntegracaoTest;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Proteção do login contra força bruta (ADR 0013, RN-67). */
class ProtecaoLoginIntegrationTest extends IntegracaoTest {

    private static final RequestPostProcessor ADMIN = user("admin@teste.org").roles("EQUIPE", "ADMIN");

    @Autowired
    private JdbcClient jdbc;

    @Test
    void cincoSenhasErradasBloqueiamOEmailSoNaqueleIp() throws Exception {
        String email = emailNovo();
        String id = criarUsuario(email, "senha-certa-1");
        String atacante = ipNovo();

        for (int i = 1; i <= 5; i++) {
            entrar(email, "chute-" + i, atacante).andExpect(status().isUnauthorized());
        }
        // bloqueado: nem a senha certa entra, e a resposta é a mesma de uma senha errada
        entrar(email, "senha-certa-1", atacante).andExpect(status().isUnauthorized());
        // a dona da conta, em outra rede, entra normalmente
        entrar(email, "senha-certa-1", ipNovo()).andExpect(status().isNoContent());

        mvc.perform(get("/api/usuarios").with(ADMIN))
                .andExpect(jsonPath("$[?(@.email == '%s')].bloqueado".formatted(email), hasItem(true)));

        mvc.perform(post("/api/usuarios/" + id + "/desbloquear").with(ADMIN).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bloqueado").value(false));
        entrar(email, "senha-certa-1", atacante).andExpect(status().isNoContent());
    }

    @Test
    void loginCertoZeraOsErrosSeguidos() throws Exception {
        String email = emailNovo();
        criarUsuario(email, "senha-certa-2");
        String rede = ipNovo();

        for (int rodada = 0; rodada < 2; rodada++) {
            for (int i = 1; i <= 4; i++) {
                entrar(email, "errei-" + i, rede).andExpect(status().isUnauthorized());
            }
            entrar(email, "senha-certa-2", rede).andExpect(status().isNoContent());
        }
    }

    @Test
    void ipQueErraTresEmailsDiferentesFicaBloqueadoPorInteiro() throws Exception {
        String email = emailNovo();
        criarUsuario(email, "senha-certa-3");
        String robo = ipNovo();

        // e-mails que nem existem também contam (o robô não sabe quais existem)
        for (int i = 1; i <= 3; i++) {
            entrar("nao-existe-" + i + "-" + UUID.randomUUID() + "@teste.org", "123456", robo)
                    .andExpect(status().isUnauthorized());
        }
        entrar(email, "senha-certa-3", robo).andExpect(status().isUnauthorized());
        entrar(email, "senha-certa-3", ipNovo()).andExpect(status().isNoContent());
    }

    @Test
    void cabecalhoXForwardedForForjadoNaoMudaOIp() throws Exception {
        String email = emailNovo();
        criarUsuario(email, "senha-certa-4");
        String atacante = ipNovo();

        // o robô inventa um "IP" diferente a cada chute, mas a conexão é a mesma
        for (int i = 1; i <= 5; i++) {
            mvc.perform(post("/api/auth/login").with(csrf()).with(ip(atacante))
                            .header("X-Forwarded-For", "203.0.113." + i)
                            .param("username", email).param("password", "chute-" + i))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/auth/login").with(csrf()).with(ip(atacante))
                        .header("X-Forwarded-For", "203.0.113.99")
                        .param("username", email).param("password", "senha-certa-4"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void muitosErrosDeVariosIpsTravamAContaPorUmTempo() throws Exception {
        String email = emailNovo();
        criarUsuario(email, "senha-certa-5");

        // 10 chutes, cada um de um IP diferente (nenhum IP chega a 5 erros)
        for (int i = 1; i <= 10; i++) {
            entrar(email, "chute-" + i, ipNovo()).andExpect(status().isUnauthorized());
        }
        // a conta recusa até a senha certa, de qualquer rede...
        entrar(email, "senha-certa-5", ipNovo()).andExpect(status().isUnauthorized());

        // ...mas é temporário: passados 15 minutos, volta a aceitar
        jdbc.sql("update tentativa_login set em = em - interval '16 minutes' where email = :email")
                .param("email", email).update();
        entrar(email, "senha-certa-5", ipNovo()).andExpect(status().isNoContent());
    }

    @Test
    void senhaErradaEBloqueadoDemoramOMesmoTempoMinimo() throws Exception {
        String email = emailNovo();
        criarUsuario(email, "senha-certa-6");
        String rede = ipNovo();

        long senhaErrada = 0;
        for (int i = 1; i <= 5; i++) {
            long inicio = System.nanoTime();
            entrar(email, "chute-" + i, rede).andExpect(status().isUnauthorized());
            senhaErrada = System.nanoTime() - inicio;
        }
        long inicio = System.nanoTime();
        entrar(email, "senha-certa-6", rede).andExpect(status().isUnauthorized()); // já bloqueado
        long bloqueado = System.nanoTime() - inicio;

        // as duas recusas esperam o mesmo piso (400 ms): pelo tempo não dá para saber qual é qual
        assertThat(senhaErrada).isGreaterThanOrEqualTo(400_000_000L);
        assertThat(bloqueado).isGreaterThanOrEqualTo(400_000_000L);
    }

    @Test
    void administradorNaoEhDesbloqueadoPelaTela() throws Exception {
        String lista = mvc.perform(get("/api/usuarios").with(ADMIN)).andReturn().getResponse().getContentAsString();
        List<String> ids = JsonPath.read(lista, "$[?(@.administrador == true)].id");

        mvc.perform(post("/api/usuarios/" + ids.get(0) + "/desbloquear").with(ADMIN).with(csrf()))
                .andExpect(status().isUnprocessableEntity());
    }

    // ------------------------------------------------------------------ apoio

    private static String emailNovo() {
        return "login-" + UUID.randomUUID().toString().substring(0, 8) + "@teste.org";
    }

    private String criarUsuario(String email, String senha) throws Exception {
        String json = mvc.perform(post("/api/usuarios").with(ADMIN).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Pessoa\", \"email\": \"%s\", \"senha\": \"%s\"}".formatted(email, senha)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return campo(json, "$.id");
    }

    private ResultActions entrar(String email, String senha, String deOnde) throws Exception {
        return mvc.perform(post("/api/auth/login").with(csrf()).with(ip(deOnde))
                .param("username", email).param("password", senha));
    }
}
