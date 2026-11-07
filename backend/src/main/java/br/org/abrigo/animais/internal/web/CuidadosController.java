package br.org.abrigo.animais.internal.web;

import br.org.abrigo.animais.internal.CuidadoResponse;
import br.org.abrigo.animais.internal.GestaoCuidados;
import br.org.abrigo.animais.internal.LoteResponse;
import br.org.abrigo.animais.internal.PendenciasVacinais;
import br.org.abrigo.animais.internal.domain.TipoCuidado;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Vacinas e vermífugo (API interna, exige login). */
@RestController
class CuidadosController {

    private static final int AVISO_MAXIMO_DIAS = 180;

    private final GestaoCuidados gestao;

    CuidadosController(GestaoCuidados gestao) {
        this.gestao = gestao;
    }

    @GetMapping("/api/animais/{id}/cuidados")
    List<CuidadoResponse> historico(@PathVariable UUID id) {
        return gestao.historico(id);
    }

    @PostMapping("/api/animais/{id}/cuidados")
    @ResponseStatus(HttpStatus.CREATED)
    CuidadoResponse registrar(@PathVariable UUID id, @Valid @RequestBody CuidadoRequest req) {
        return gestao.registrar(id, req.tipo(), req.aplicadoEm(), req.proximoEm(), req.observacao());
    }

    @DeleteMapping("/api/animais/{id}/cuidados/{cuidadoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void remover(@PathVariable UUID id, @PathVariable UUID cuidadoId) {
        gestao.remover(id, cuidadoId);
    }

    @PostMapping("/api/cuidados/lote")
    @ResponseStatus(HttpStatus.CREATED)
    LoteResponse registrarEmLote(@Valid @RequestBody LoteRequest req) {
        return gestao.registrarEmLote(req.animais(), req.tipo(), req.aplicadoEm(), req.proximoEm(), req.observacao());
    }

    /** Home da equipe: vencidas, vencendo nos próximos {dias} e sem registro. */
    @GetMapping("/api/cuidados/pendencias")
    PendenciasVacinais pendencias(@RequestParam(defaultValue = "30") int dias) {
        return gestao.pendencias(Math.clamp(dias, 0, AVISO_MAXIMO_DIAS));
    }

    /** proximoEm vazio = o sistema sugere pelo padrão do tipo (V8 e raiva: +1 ano). */
    record CuidadoRequest(
            @NotNull(message = "Informe o que foi aplicado") TipoCuidado tipo,
            @NotNull(message = "Informe a data da aplicação") LocalDate aplicadoEm,
            LocalDate proximoEm,
            @Size(max = 200) String observacao) {
    }

    record LoteRequest(
            @NotEmpty(message = "Selecione ao menos um animal") List<@NotNull UUID> animais,
            @NotNull(message = "Informe o que foi aplicado") TipoCuidado tipo,
            @NotNull(message = "Informe a data da aplicação") LocalDate aplicadoEm,
            LocalDate proximoEm,
            @Size(max = 200) String observacao) {
    }
}
