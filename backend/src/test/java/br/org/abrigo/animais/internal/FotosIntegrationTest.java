package br.org.abrigo.animais.internal;

import br.org.abrigo.plataforma.ArmazenamentoArquivos;
import br.org.abrigo.suporte.IntegracaoTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockMultipartFile;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Envio de foto gera média e mini; remover apaga as três; foto sem versões usa o original. */
class FotosIntegrationTest extends IntegracaoTest {

    @Autowired
    ArmazenamentoArquivos armazenamento;

    @Autowired
    JdbcClient jdbc;

    @Test
    void envioGeraAsVersoesERemoverApagaTodas() throws Exception {
        String animal = cadastrarAnimalSimples("Fotogênica");
        String id = campo(animal, "$.id");
        String slug = campo(animal, "$.slug");

        String resposta = mvc.perform(multipart("/api/animais/{id}/fotos", id)
                        .file(new MockMultipartFile("arquivo", "foto.png", "image/png", VersoesFotoTest.png(1600, 1200)))
                        .with(user(EQUIPE)).with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fotos[0].grande", endsWith(".png")))
                .andExpect(jsonPath("$.fotos[0].media", endsWith("-m.jpg")))
                .andExpect(jsonPath("$.fotos[0].mini", endsWith("-p.jpg")))
                .andReturn().getResponse().getContentAsString();
        String media = campo(resposta, "$.fotos[0].media");
        String fotoId = campo(resposta, "$.fotos[0].id");

        mvc.perform(get(media)).andExpect(status().isOk()).andExpect(content().contentType("image/jpeg"));
        mvc.perform(get("/api/public/animais/" + slug))
                .andExpect(jsonPath("$.fotoPrincipal.media").value(media))
                .andExpect(jsonPath("$.fotos[0].mini", endsWith("-p.jpg")));
        mvc.perform(get("/animais/" + slug)) // prévia do WhatsApp usa a média
                .andExpect(content().string(containsString(media)));

        mvc.perform(delete("/api/animais/{id}/fotos/{fotoId}", id, fotoId).with(user(EQUIPE)).with(csrf()))
                .andExpect(status().isOk());
        mvc.perform(get(media)).andExpect(status().isNotFound());
    }

    @Test
    void fotoSemVersoesUsaOOriginalNosTresTamanhos() throws Exception {
        String id = campo(cadastrarAnimalSimples("Antiga"), "$.id");
        String chave = armazenamento.salvar("animais/" + id, "png", VersoesFotoTest.png(1000, 1000));
        jdbc.sql("""
                        insert into foto_animal (id, animal_id, chave_arquivo, principal, ordem, adicionada_em, com_versoes)
                        values (?, ?, ?, true, 0, now(), false)""")
                .params(UUID.randomUUID(), UUID.fromString(id), chave)
                .update();

        String original = armazenamento.urlPublica(chave);
        mvc.perform(get("/api/animais/{id}", id).with(user(EQUIPE)))
                .andExpect(jsonPath("$.fotos[0].grande").value(original))
                .andExpect(jsonPath("$.fotos[0].media").value(original))
                .andExpect(jsonPath("$.fotos[0].mini").value(original));
    }
}
