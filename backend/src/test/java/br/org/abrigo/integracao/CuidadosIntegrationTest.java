package br.org.abrigo.integracao;

import br.org.abrigo.suporte.IntegracaoTest;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Vacinas/vermífugo de ponta a ponta. Cada teste usa uma ala própria: o banco é compartilhado entre as classes. */
class CuidadosIntegrationTest extends IntegracaoTest {

    static final LocalDate HOJE = LocalDate.now(ZoneId.of("America/Sao_Paulo"));

    @Test
    void registraVacinaComProximaDoseSugeridaEHistorico() throws Exception {
        String id = campo(cadastrarNaAla("Biscoito", ala()), "$.id");

        mvc.perform(post("/api/animais/" + id + "/cuidados").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\": \"V8\", \"aplicadoEm\": \"%s\"}".formatted(HOJE.minusDays(10))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.proximoEm").value(HOJE.minusDays(10).plusYears(1).toString()))
                .andExpect(jsonPath("$.criadoPor").value(EQUIPE));

        mvc.perform(get("/api/animais/" + id + "/cuidados").with(user(EQUIPE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].tipo").value("V8"));
    }

    @Test
    void dataFuturaDa422() throws Exception {
        String id = campo(cadastrarNaAla("Lucke", ala()), "$.id");

        mvc.perform(post("/api/animais/" + id + "/cuidados").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\": \"RAIVA\", \"aplicadoEm\": \"%s\"}".formatted(HOJE.plusDays(1))))
                .andExpect(status().is(422));
    }

    @Test
    void loteVermifugaAAlaInteiraNumRegistroSo() throws Exception {
        String ala = ala();
        String a = campo(cadastrarNaAla("Borja", ala), "$.id");
        String b = campo(cadastrarNaAla("Rael", ala), "$.id");

        String resposta = mvc.perform(post("/api/cuidados/lote").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tipo": "VERMIFUGO", "aplicadoEm": "%s", "animais": ["%s", "%s"]}
                                """.formatted(HOJE, a, b)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.registrados").value(2))
                .andReturn().getResponse().getContentAsString();

        String lote = campo(resposta, "$.loteId");
        mvc.perform(get("/api/animais/" + b + "/cuidados").with(user(EQUIPE)))
                .andExpect(jsonPath("$[0].loteId").value(lote))
                .andExpect(jsonPath("$[0].proximoEm").isEmpty());
    }

    @Test
    void loteComAnimalAdotadoNaoGravaNada() throws Exception {
        String ala = ala();
        String a = campo(cadastrarNaAla("Tody", ala), "$.id");
        String adotado = campo(cadastrarNaAla("Maia", ala), "$.id");
        mvc.perform(post("/api/animais/" + adotado + "/situacao").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"situacao\": \"ADOTADO\"}"))
                .andExpect(status().isOk());

        mvc.perform(post("/api/cuidados/lote").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tipo": "V8", "aplicadoEm": "%s", "animais": ["%s", "%s"]}
                                """.formatted(HOJE, a, adotado)))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Maia")));

        mvc.perform(get("/api/animais/" + a + "/cuidados").with(user(EQUIPE)))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void pendenciasAgrupamPorAlaPelaPiorVacina() throws Exception {
        String ala = ala();
        String vencido = campo(cadastrarNaAla("Yuri", ala), "$.id");     // V8 e raiva de 2 anos atrás
        String vencendo = campo(cadastrarNaAla("Pipa", ala), "$.id");    // vence em 10 dias
        String emDia = campo(cadastrarNaAla("Catarina", ala), "$.id");   // aplicada há 1 mês
        cadastrarNaAla("Lele", ala);                                     // nunca registrada

        registrarV8eRaiva(vencido, HOJE.minusYears(2), null);
        registrarV8eRaiva(vencendo, HOJE.minusYears(1).plusDays(10), null);
        registrarV8eRaiva(emDia, HOJE.minusMonths(1), null);

        String json = mvc.perform(get("/api/cuidados/pendencias?dias=30").with(user(EQUIPE)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        List<Object> resumoAla = JsonPath.read(json, "$.alas[?(@.ala == '" + ala + "')]");
        assertThat(resumoAla).hasSize(1);
        assertThat(campo(json, "$.alas[?(@.ala == '" + ala + "')].vencidas")).isEqualTo("[1]");
        assertThat(campo(json, "$.alas[?(@.ala == '" + ala + "')].vencendo")).isEqualTo("[1]");
        assertThat(campo(json, "$.alas[?(@.ala == '" + ala + "')].semRegistro")).isEqualTo("[1]");
        assertThat(campo(json, "$.alas[?(@.ala == '" + ala + "')].total")).isEqualTo("[4]");

        List<String> nomes = JsonPath.read(json, "$.animais[?(@.ala == '" + ala + "')].nome");
        assertThat(nomes).containsExactly("Yuri", "Lele", "Pipa"); // vencida > sem registro > vencendo
        assertThat(campo(json, "$.animais[?(@.nome == 'Yuri' && @.ala == '" + ala + "')].situacao"))
                .isEqualTo("[\"VENCIDA\"]");
    }

    @Test
    void vitrineMostraSeAsVacinasEstaoEmDia() throws Exception {
        String animal = cadastrarNaAla("Frederico", ala());
        String id = campo(animal, "$.id");
        String slug = campo(animal, "$.slug");

        mvc.perform(get("/api/public/animais/" + slug)).andExpect(jsonPath("$.vacinasEmDia").isEmpty());

        registrarV8eRaiva(id, HOJE.minusMonths(1), null);
        mvc.perform(get("/api/public/animais/" + slug)).andExpect(jsonPath("$.vacinasEmDia").value(true));
    }

    @Test
    void removeRegistroFeitoErrado() throws Exception {
        String id = campo(cadastrarNaAla("Sombra", ala()), "$.id");
        String c = mvc.perform(post("/api/animais/" + id + "/cuidados").with(user(EQUIPE)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\": \"RAIVA\", \"aplicadoEm\": \"%s\"}".formatted(HOJE)))
                .andReturn().getResponse().getContentAsString();

        mvc.perform(delete("/api/animais/" + id + "/cuidados/" + campo(c, "$.id")).with(user(EQUIPE)).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/animais/" + id + "/cuidados").with(user(EQUIPE)))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void semLoginNaoAcessa() throws Exception {
        mvc.perform(get("/api/cuidados/pendencias")).andExpect(status().isUnauthorized());
    }

    // ------------------------------------------------------------------ apoio

    private static String ala() {
        return "Ala " + UUID.randomUUID().toString().substring(0, 8);
    }

    private String cadastrarNaAla(String nome, String ala) throws Exception {
        return cadastrarAnimal("""
                {"nome": "%s", "especie": "CAO", "sexo": "MACHO", "ala": "%s", "canil": "1A",
                 "chip": "%s"}
                """.formatted(nome, ala, UUID.randomUUID().toString().substring(0, 15)));
    }

    private void registrarV8eRaiva(String animalId, LocalDate aplicadoEm, LocalDate proximoEm) throws Exception {
        for (String tipo : List.of("V8", "RAIVA")) {
            mvc.perform(post("/api/animais/" + animalId + "/cuidados").with(user(EQUIPE)).with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"tipo\": \"%s\", \"aplicadoEm\": \"%s\", \"proximoEm\": %s}".formatted(
                                    tipo, aplicadoEm, proximoEm == null ? "null" : "\"" + proximoEm + "\"")))
                    .andExpect(status().isCreated());
        }
    }
}
