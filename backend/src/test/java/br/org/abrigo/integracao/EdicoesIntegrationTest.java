package br.org.abrigo.integracao;

import br.org.abrigo.suporte.IntegracaoTest;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Aviso de presença na edição (ADR 0014). */
class EdicoesIntegrationTest extends IntegracaoTest {

    @Test
    void avisaQuemMaisEstaEditandoPeloNome() throws Exception {
        String rota = "/api/edicoes/animal/" + UUID.randomUUID();

        mvc.perform(post(rota).with(user("admin@teste.org")).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mvc.perform(post(rota).with(user(EQUIPE)).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome").value("Administrador"))
                .andExpect(jsonPath("$[0].desde").exists());

        mvc.perform(delete(rota).with(user("admin@teste.org")).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(post(rota).with(user(EQUIPE)).with(csrf()))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void exigeLoginETipoValido() throws Exception {
        String id = UUID.randomUUID().toString();
        mvc.perform(post("/api/edicoes/animal/" + id).with(csrf())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/edicoes/ANIMAL-1/" + id).with(user(EQUIPE)).with(csrf()))
                .andExpect(status().isUnprocessableEntity());
    }
}
