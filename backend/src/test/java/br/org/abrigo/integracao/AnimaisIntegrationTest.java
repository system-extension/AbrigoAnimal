package br.org.abrigo.integracao;

import br.org.abrigo.suporte.IntegracaoTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AnimaisIntegrationTest extends IntegracaoTest {

    @Test
    void cadastraEAparecenaVitrine() throws Exception {
        String animal = cadastrarAnimalSimples("Pipoca");
        String slug = campo(animal, "$.slug");

        mvc.perform(get("/api/public/animais/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Pipoca"))
                .andExpect(jsonPath("$.idoso").value(true))
                .andExpect(jsonPath("$.disponivelParaAdocao").value(true));
    }

    @Test
    void validacaoDeFormatoDevolveCampos() throws Exception {
        mvc.perform(post("/api/animais").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"especie\": \"CAO\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").exists());
    }

    @Test
    void chipDuplicadoEhRegraDeNegocio() throws Exception {
        cadastrarAnimal("{\"nome\": \"A\", \"especie\": \"CAO\", \"chip\": \"CHIP-DUP-1\"}");

        mvc.perform(post("/api/animais").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"B\", \"especie\": \"CAO\", \"chip\": \"CHIP-DUP-1\"}"))
                .andExpect(status().is(422));
    }

    @Test
    void chipAdicionalTambemNaoPodeRepetir() throws Exception {
        // o leitor pode ler qualquer um dos dois chips: os dois precisam ser únicos no cadastro inteiro
        cadastrarAnimal("{\"nome\": \"Celi\", \"especie\": \"CAO\", \"chip\": \"CHIP-A-1\", \"chipAdicional\": \"CHIP-B-1\"}");

        mvc.perform(post("/api/animais").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Outro\", \"especie\": \"CAO\", \"chip\": \"CHIP-B-1\"}"))
                .andExpect(status().is(422));
    }

    @Test
    void buscaEncontraPeloChipAdicional() throws Exception {
        cadastrarAnimal("{\"nome\": \"Bicuda\", \"especie\": \"CAO\", \"chip\": \"963003002252391\", \"chipAdicional\": \"963003002176468\"}");

        mvc.perform(get("/api/animais").param("busca", "963 003 002 176468").with(user(EQUIPE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[0].nome").value("Bicuda"));
    }

    @Test
    void vitrineMostraPorteTemperamentoECastradoNaoInformado() throws Exception {
        String slug = campo(cadastrarAnimal("""
                {"nome": "Margarida", "especie": "CAO", "porte": "MEDIO", "temperamento": ["Dócil", "Calmo"],
                 "medicacoes": "Remédio para o coração"}
                """), "$.slug");

        mvc.perform(get("/api/public/animais/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.porte").value("MEDIO"))
                .andExpect(jsonPath("$.temperamento[1]").value("Calmo"))
                .andExpect(jsonPath("$.castrado").isEmpty())
                .andExpect(jsonPath("$.medicacaoContinua").value(true));
    }

    @Test
    void vacinasVaoJuntoNoCadastroEAVitrineMostraSoQuais() throws Exception {
        String animal = cadastrarAnimal("""
                {"nome": "Biscoito", "especie": "CAO",
                 "vacinas": [{"tipo": "V8_V10", "ultimaDose": "2025-12-29"}, {"tipo": "ANTIRRABICA"}]}
                """);
        String id = campo(animal, "$.id");

        mvc.perform(get("/api/animais/" + id).with(user(EQUIPE)))
                .andExpect(jsonPath("$.vacinas.length()").value(2))
                .andExpect(jsonPath("$.vacinas[?(@.tipo == 'V8_V10')].ultimaDose").value("2025-12-29"));

        mvc.perform(get("/api/public/animais/" + campo(animal, "$.slug")))
                .andExpect(jsonPath("$.vacinas.length()").value(2))
                .andExpect(jsonPath("$.vacinas[0]").value("ANTIRRABICA"));

        // editar com a lista vazia remove as vacinas (a lista enviada substitui a anterior)
        mvc.perform(put("/api/animais/" + id).with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Biscoito\", \"especie\": \"CAO\", \"versao\": 0, \"vacinas\": []}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vacinas.length()").value(0));
    }

    @Test
    void vacinaComDataFuturaDa400() throws Exception {
        mvc.perform(post("/api/animais").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome": "Bob", "especie": "CAO", "vacinas": [{"tipo": "V8_V10", "ultimaDose": "2999-01-01"}]}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void filtroSemFotoMostraSoQuemPrecisaDeFoto() throws Exception {
        String nome = "SemFoto-" + java.util.UUID.randomUUID().toString().substring(0, 6);
        cadastrarAnimal("{\"nome\": \"" + nome + "\", \"especie\": \"CAO\"}");

        mvc.perform(get("/api/animais").param("semFoto", "true").param("busca", nome).with(user(EQUIPE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void obitoTiraDaVitrine() throws Exception {
        String animal = cadastrarAnimalSimples("Estrela");
        String id = campo(animal, "$.id");
        String slug = campo(animal, "$.slug");

        mvc.perform(post("/api/animais/" + id + "/obito").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"data\": \"2026-01-10\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.situacao").value("OBITO"));

        mvc.perform(get("/api/public/animais/" + slug)).andExpect(status().isNotFound());
    }

    @Test
    void edicaoComVersaoDesatualizadaDa409() throws Exception {
        String animal = cadastrarAnimalSimples("Luna");
        String id = campo(animal, "$.id");
        String corpo = "{\"nome\": \"Luna 2\", \"especie\": \"CAO\", \"versao\": %s}";

        mvc.perform(put("/api/animais/" + id).with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(corpo.formatted(0)))
                .andExpect(status().isOk());

        // segunda edição ainda com a versão 0: alguém já salvou antes
        mvc.perform(put("/api/animais/" + id).with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(corpo.formatted(0)))
                .andExpect(status().isConflict());
    }

    @Test
    void respostaTrazAVersaoNovaParaOProximoSalvar() throws Exception {
        String id = campo(cadastrarAnimalSimples("Mel"), "$.id");
        String corpo = "{\"nome\": \"Mel\", \"especie\": \"CAO\", \"versao\": %s}";

        // troca a situação e, em seguida, salva o cadastro com a versão que veio na resposta
        String aposSituacao = mvc.perform(post("/api/animais/" + id + "/situacao").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"situacao\": \"EM_TRATAMENTO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.versao").value(1))
                .andReturn().getResponse().getContentAsString();

        String aposEditar = mvc.perform(put("/api/animais/" + id).with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo.formatted(campo(aposSituacao, "$.versao"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.versao").value(2))
                .andReturn().getResponse().getContentAsString();

        // a resposta do PUT também serve para o salvar seguinte (antes dava falso 409)
        mvc.perform(put("/api/animais/" + id).with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo.formatted(campo(aposEditar, "$.versao"))))
                .andExpect(status().isOk());
    }

    @Test
    void auditoriaRegistraQuemAlterou() throws Exception {
        String animal = cadastrarAnimalSimples("Nina");

        org.assertj.core.api.Assertions.assertThat(campo(animal, "$.atualizadoPor")).isEqualTo(EQUIPE);
    }

    @Test
    void detalheTrazONomeDeQuemAlterouNaoSoOEmail() throws Exception {
        mvc.perform(post("/api/animais").with(user("admin@teste.org")).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nome\": \"Fubá\", \"especie\": \"CAO\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.atualizadoPor").value("admin@teste.org"))
                .andExpect(jsonPath("$.atualizadoPorNome").value("Administrador"));

        // quem não é da equipe cadastrada (ex.: carga inicial) não tem nome: a tela não mostra login técnico
        String animal = cadastrarAnimalSimples("Canjica");
        org.assertj.core.api.Assertions.assertThat(campo(animal, "$.atualizadoPorNome")).isNull();
    }

    @Test
    void linkCompartilhadoTemPreviaComNomeDoAnimal() throws Exception {
        String slug = campo(cadastrarAnimalSimples("Paçoca"), "$.slug");

        mvc.perform(get("/animais/" + slug))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("og:title")))
                .andExpect(content().string(containsString("https://abrigo.teste/animais/" + slug)));
    }
}
