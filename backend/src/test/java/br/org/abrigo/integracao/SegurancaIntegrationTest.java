package br.org.abrigo.integracao;

import br.org.abrigo.suporte.IntegracaoTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SegurancaIntegrationTest extends IntegracaoTest {

    @Test
    void apiInternaExigeLogin() throws Exception {
        mvc.perform(get("/api/animais")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/pessoas")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void apiPublicaEHealthSaoAbertos() throws Exception {
        mvc.perform(get("/api/public/animais")).andExpect(status().isOk());
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void postSemTokenCsrfEhRecusado() throws Exception {
        mvc.perform(post("/api/auth/login").param("username", "admin@teste.org").param("password", "senha-forte-123"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminInicialConsegueEntrarEConsultarQuemEsta() throws Exception {
        MockHttpSession sessao = new MockHttpSession();

        mvc.perform(post("/api/auth/login").session(sessao).with(csrf())
                        .param("username", "admin@teste.org").param("password", "senha-forte-123"))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/auth/me").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@teste.org"))
                .andExpect(jsonPath("$.administrador").value(true));
    }

    @Test
    void senhaErradaDa401() throws Exception {
        mvc.perform(post("/api/auth/login").with(csrf())
                        .param("username", "admin@teste.org").param("password", "errada"))
                .andExpect(status().isUnauthorized());
    }
}
