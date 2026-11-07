package br.org.abrigo.animais.internal.web;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.animais.internal.AnimalDetalhe;
import br.org.abrigo.animais.internal.AnimalListagem;
import br.org.abrigo.animais.internal.GestaoAnimais;
import br.org.abrigo.animais.internal.persistence.EspecificacoesAnimal.FiltroAnimais;
import br.org.abrigo.plataforma.Pagina;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.UUID;

/**
 * API interna (exige login) de animais. O controller só traduz HTTP ↔ caso de uso:
 * valida o FORMATO (@Valid) e delega. Nenhuma regra de negócio aqui.
 */
@RestController
@RequestMapping("/api/animais")
class AnimaisController {

    private static final int TAMANHO_MAXIMO_PAGINA = 50;

    private final GestaoAnimais gestao;

    AnimaisController(GestaoAnimais gestao) {

        this.gestao = gestao;
    }

    @GetMapping
    Pagina<AnimalListagem> listar(@RequestParam(required = false) String busca,
                                  @RequestParam(required = false) Especie especie,
                                  @RequestParam(required = false) SituacaoAnimal situacao,
                                  @RequestParam(required = false) String ala,
                                  @RequestParam(required = false) Boolean idoso,
                                  @RequestParam(required = false) Boolean semFoto,
                                  @RequestParam(defaultValue = "0") int pagina,
                                  @RequestParam(defaultValue = "20") int tamanho) {
        var pageable = PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO_PAGINA),
                Sort.by("nome"));
        return gestao.listar(new FiltroAnimais(busca, especie, situacao, ala, idoso, semFoto), pageable);
    }

    @GetMapping("/{id}")
    AnimalDetalhe buscar(@PathVariable UUID id) {
        return gestao.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    AnimalDetalhe cadastrar(@Valid @RequestBody AnimalRequest req) {
        return gestao.cadastrar(req.paraDados());
    }

    @PutMapping("/{id}")
    AnimalDetalhe atualizar(@PathVariable UUID id, @Valid @RequestBody AnimalRequest req) {
        return gestao.atualizar(id, req.paraDados(), req.versao());
    }

    @PostMapping("/{id}/situacao")
    AnimalDetalhe alterarSituacao(@PathVariable UUID id, @Valid @RequestBody SituacaoRequest req) {
        return gestao.alterarSituacao(id, req.situacao());
    }

    @PostMapping("/{id}/obito")
    AnimalDetalhe registrarObito(@PathVariable UUID id, @Valid @RequestBody ObitoRequest req) {
        return gestao.registrarObito(id, req.data());
    }

    @PostMapping("/{id}/vitrine")
    AnimalDetalhe alterarVisibilidade(@PathVariable UUID id, @Valid @RequestBody VisibilidadeRequest req) {
        return gestao.alterarVisibilidade(id, req.visivel());
    }

    @PostMapping(path = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    AnimalDetalhe adicionarFoto(@PathVariable UUID id, @RequestPart("arquivo") MultipartFile arquivo) {
        return gestao.adicionarFoto(id, arquivo);
    }

    @DeleteMapping("/{id}/fotos/{fotoId}")
    AnimalDetalhe removerFoto(@PathVariable UUID id, @PathVariable UUID fotoId) {
        return gestao.removerFoto(id, fotoId);
    }

    @PostMapping("/{id}/fotos/{fotoId}/principal")
    AnimalDetalhe definirFotoPrincipal(@PathVariable UUID id, @PathVariable UUID fotoId) {
        return gestao.definirFotoPrincipal(id, fotoId);
    }

    record SituacaoRequest(@NotNull(message = "Informe a situação") SituacaoAnimal situacao) {
    }

    record ObitoRequest(@NotNull(message = "Informe a data do óbito") LocalDate data) {
    }

    record VisibilidadeRequest(@NotNull Boolean visivel) {
    }
}
