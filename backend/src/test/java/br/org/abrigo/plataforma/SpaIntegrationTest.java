package br.org.abrigo.plataforma;

import br.org.abrigo.suporte.IntegracaoTest;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Site (React) servido pelo próprio Spring: rotas do React caem no index.html,
 * rotas de servidor e arquivos inexistentes dão 404 de verdade, e o cache segue a regra do SpaConfig.
 * O index.html e o asset usados aqui são de teste (src/test/resources/static).
 *
 * <p>Obs.: /animais/{slug} não entra aqui: é do OpenGraphController (prévia do WhatsApp),
 * testado em AnimaisIntegrationTest.
 */
class SpaIntegrationTest extends IntegracaoTest {

    @Test
    void rotaDoReactEntregaIndexSemCache() throws Exception {
        for (String rota : new String[] {"/painel/animais", "/painel/animais/novo", "/sobre"}) {
            mvc.perform(get(rota))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("teste-spa")))
                    .andExpect(header().string("Cache-Control", containsString("no-cache")));
        }
    }

    /**
     * A raiz "/" é atendida pela "página de boas-vindas" do Spring Boot, que faz um forward interno
     * para index.html (servido pelo SpaConfig, sem cache). O MockMvc não executa forwards,
     * então aqui só se confere o destino.
     */
    @Test
    void raizEncaminhaParaIndex() throws Exception {
        mvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("index.html"));
        mvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("teste-spa")))
                .andExpect(header().string("Cache-Control", containsString("no-cache")));
    }

    @Test
    void assetComHashFicaEmCacheLongo() throws Exception {
        mvc.perform(get("/assets/app-teste.js"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("max-age=31536000")))
                .andExpect(header().string("Cache-Control", containsString("immutable")));
    }

    @Test
    void arquivoOuRotaDeServidorInexistenteDa404() throws Exception {
        mvc.perform(get("/assets/nao-existe.js")).andExpect(status().isNotFound());
        mvc.perform(get("/logo-nao-existe.png")).andExpect(status().isNotFound());
        mvc.perform(get("/api/public/nao-existe")).andExpect(status().isNotFound());
        mvc.perform(get("/arquivos/nao-existe.jpg")).andExpect(status().isNotFound());
    }
}
