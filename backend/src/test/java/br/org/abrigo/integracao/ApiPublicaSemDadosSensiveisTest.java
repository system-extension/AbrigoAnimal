package br.org.abrigo.integracao;

import br.org.abrigo.suporte.IntegracaoTest;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * O TESTE MAIS IMPORTANTE DO SISTEMA (decisão T3 / LGPD).
 * Cadastra dados sensíveis e garante que NENHUMA rota pública os devolve.
 * Se alguém adicionar um campo sensível à vitrine por engano, este teste quebra o CI.
 */
class ApiPublicaSemDadosSensiveisTest extends IntegracaoTest {

    private static final List<String> CAMPOS_PROIBIDOS = List.of(
            "\"cpf\"", "\"telefone\"", "\"email\"", "\"endereco\"",   // pessoas
            "\"chip\"", "\"chipAdicional\"", "\"canil\"", "\"ala\"",    // identificação e localização interna
            "\"ultimaDose\"",                                              // a vitrine diz QUAIS vacinas, não quando
            "\"criadoPor\"", "\"atualizadoPor\"", "\"id\"");          // dados internos

    private static final List<String> VALORES_PROIBIDOS = List.of(
            "52998224725", "Rua Secreta", "pessoa@exemplo.com");

    @Test
    void rotasPublicasNaoExpoemDadosPessoaisNemInternos() throws Exception {
        String slug = campo(cadastrarAnimalSimples("Guardião"), "$.slug");
        cadastrarPessoa("Pessoa Sensível", "529.982.247-25");

        String lista = mvc.perform(get("/api/public/animais"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String detalhe = mvc.perform(get("/api/public/animais/" + slug))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

        for (String resposta : List.of(lista, detalhe)) {
            assertThat(resposta).doesNotContain(CAMPOS_PROIBIDOS.toArray(String[]::new));
            assertThat(resposta).doesNotContain(VALORES_PROIBIDOS.toArray(String[]::new));
        }
    }
}
