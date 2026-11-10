package br.org.abrigo.suporte;

import com.jayway.jsonpath.JsonPath;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base dos testes de integração: aplicação inteira + Postgres real (Testcontainers) + MockMvc.
 * O contexto Spring é reaproveitado entre as classes de teste (mesmas configurações = mesmo cache).
 */
@SpringBootTest(properties = {
        "abrigo.admin.email=admin@teste.org",
        "abrigo.admin.senha=senha-forte-123",
        "abrigo.solicitacoes.limite-por-hora=3",
        "abrigo.armazenamento.diretorio=target/arquivos-teste",
        "abrigo.url-publica=https://abrigo.teste"
})
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
public abstract class IntegracaoTest {

    protected static final String EQUIPE = "equipe@teste.org";

    @Autowired
    protected MockMvc mvc;

    /** Cadastra um animal pela API interna e devolve o JSON de resposta. */
    protected String cadastrarAnimal(String json) throws Exception {
        MvcResult r = mvc.perform(post("/api/animais")
                        .with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn();
        return r.getResponse().getContentAsString();
    }

    protected String cadastrarAnimalSimples(String nome) throws Exception {
        return cadastrarAnimal("""
                {"nome": "%s", "especie": "CAO", "sexo": "FEMEA", "idoso": true,
                 "descricao": "Muito carinhosa", "chip": "%s", "canil": "C1", "ala": "Ala 1"}
                """.formatted(nome, UUID.randomUUID().toString().substring(0, 12)));
    }

    protected String cadastrarPessoa(String nome, String cpf) throws Exception {
        MvcResult r = mvc.perform(post("/api/pessoas")
                        .with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome": "%s", "telefone": "(47) 99999-0000", "email": "pessoa@exemplo.com",
                                 "cpf": %s, "endereco": "Rua Secreta, 123", "consentiu": true}
                                """.formatted(nome, cpf == null ? "null" : "\"" + cpf + "\"")))
                .andExpect(status().isCreated())
                .andReturn();
        return r.getResponse().getContentAsString();
    }

    /**
     * Simula o IP de quem fez a requisição. Testes de login usam um IP próprio para que as senhas
     * erradas de um teste não bloqueiem o login de outro (ADR 0013).
     */
    protected static RequestPostProcessor ip(String endereco) {
        return requisicao -> {
            requisicao.setRemoteAddr(endereco);
            return requisicao;
        };
    }

    protected static String ipNovo() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        return "10." + r.nextInt(256) + "." + r.nextInt(256) + "." + r.nextInt(1, 255);
    }

    protected static String campo(String json, String caminho) {
        Object valor = JsonPath.read(json, caminho);
        return valor == null ? null : valor.toString();
    }
}
