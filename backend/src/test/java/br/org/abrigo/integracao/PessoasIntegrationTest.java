package br.org.abrigo.integracao;

import br.org.abrigo.suporte.IntegracaoTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PessoasIntegrationTest extends IntegracaoTest {

    @Test
    void edicaoRespondeComAVersaoNova() throws Exception {
        String id = campo(cadastrarPessoa("Rosa", null), "$.id");

        mvc.perform(put("/api/pessoas/" + id).with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Rosa Maria\", \"telefone\": \"(47) 99999-0000\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Rosa Maria"))
                .andExpect(jsonPath("$.versao").value(1));
    }
}
