package br.org.abrigo.integracao;

import br.org.abrigo.suporte.IntegracaoTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UsuariosIntegrationTest extends IntegracaoTest {

    /** Gerenciar a equipe é só do administrador (ADR 0012). */
    private static final RequestPostProcessor ADMIN = user("admin@teste.org").roles("EQUIPE", "ADMIN");
    private static final RequestPostProcessor COMUM = user(EQUIPE).roles("EQUIPE");

    @Test
    void quemNaoEhAdministradorNaoGerenciaAEquipe() throws Exception {
        String id = campo(criarUsuario(emailNovo(), "senha-forte-7"), "$.id");

        mvc.perform(get("/api/usuarios").with(COMUM)).andExpect(status().isForbidden());
        mvc.perform(post("/api/usuarios").with(COMUM).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Intrusa\", \"email\": \"intrusa@teste.org\", \"senha\": \"senha-forte-1\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/usuarios/" + id + "/senha").with(COMUM).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"novaSenha\": \"tomei-a-conta\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/usuarios/" + id + "/desativar").with(COMUM).with(csrf()))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/usuarios/" + id + "/reativar").with(COMUM).with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void usuarioNovoNaoNasceAdministrador() throws Exception {
        criar(emailNovo(), "senha-forte-8")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.administrador").value(false));
    }

    @Test
    void trocaAPropriaSenhaSoComASenhaAtual() throws Exception {
        String email = emailNovo();
        criarUsuario(email, "senha-antiga-1");

        trocarSenha(email, "senha-errada", "senha-nova-123").andExpect(status().isUnprocessableEntity());
        trocarSenha(email, "senha-antiga-1", "senha-antiga-1").andExpect(status().isUnprocessableEntity());
        trocarSenha(email, "senha-antiga-1", "senha-nova-123").andExpect(status().isNoContent());

        entrar(email, "senha-antiga-1").andExpect(status().isUnauthorized());
        entrar(email, "senha-nova-123").andExpect(status().isNoContent());
    }

    @Test
    void colegaRedefineSenhaDeQuemEsqueceu() throws Exception {
        String email = emailNovo();
        String id = campo(criarUsuario(email, "esqueci-a-senha"), "$.id");

        mvc.perform(post("/api/usuarios/" + id + "/senha").with(ADMIN).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"novaSenha\": \"provisoria-123\"}"))
                .andExpect(status().isOk());

        entrar(email, "provisoria-123").andExpect(status().isNoContent());
    }

    @Test
    void administradorNaoRedefineAPropriaSenhaSemASenhaAtual() throws Exception {
        String email = emailNovo();
        String id = campo(criarUsuario(email, "minha-senha-1"), "$.id");

        // mesmo com o perfil de administrador, a própria senha só muda pela troca com a senha atual
        mvc.perform(post("/api/usuarios/" + id + "/senha").with(user(email).roles("EQUIPE", "ADMIN")).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"novaSenha\": \"outra-senha-1\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void desativadoNaoEntraEReativadoVolta() throws Exception {
        String email = emailNovo();
        String id = campo(criarUsuario(email, "senha-forte-9"), "$.id");

        mvc.perform(post("/api/usuarios/" + id + "/desativar").with(ADMIN).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));
        entrar(email, "senha-forte-9").andExpect(status().isUnauthorized());

        mvc.perform(post("/api/usuarios/" + id + "/reativar").with(ADMIN).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(true));
        entrar(email, "senha-forte-9").andExpect(status().isNoContent());
    }

    @Test
    void senhaAcimaDoLimiteDoBcryptEhRecusada() throws Exception {
        // 40 letras "ç" = 80 bytes: passa no limite de caracteres, mas não cabe no BCrypt (72 bytes)
        criar(emailNovo(), "ç".repeat(40)).andExpect(status().isUnprocessableEntity());
    }

    // ------------------------------------------------------------------ apoio

    private static String emailNovo() {
        return "pessoa-" + UUID.randomUUID().toString().substring(0, 8) + "@teste.org";
    }

    private ResultActions criar(String email, String senha) throws Exception {
        return mvc.perform(post("/api/usuarios").with(ADMIN).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\": \"Pessoa da Equipe\", \"email\": \"%s\", \"senha\": \"%s\"}"
                        .formatted(email, senha)));
    }

    private String criarUsuario(String email, String senha) throws Exception {
        return criar(email, senha).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
    }

    private ResultActions trocarSenha(String email, String atual, String nova) throws Exception {
        return mvc.perform(post("/api/auth/senha").with(user(email)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"senhaAtual\": \"%s\", \"novaSenha\": \"%s\"}".formatted(atual, nova)));
    }

    private ResultActions entrar(String email, String senha) throws Exception {
        return mvc.perform(post("/api/auth/login").with(csrf()).param("username", email).param("password", senha));
    }
}
