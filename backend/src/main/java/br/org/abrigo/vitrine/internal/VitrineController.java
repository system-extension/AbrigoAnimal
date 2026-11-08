package br.org.abrigo.vitrine.internal;

import br.org.abrigo.animais.AnimalService;
import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.plataforma.Pagina;
import br.org.abrigo.plataforma.RecursoNaoEncontradoException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/animais")
class VitrineController {

    private final AnimalService animais;

    VitrineController(AnimalService animais) {
        this.animais = animais;
    }

    @GetMapping
    Pagina<AnimalPublicoResponse> listar(@RequestParam(required = false) Especie especie,
                                         @RequestParam(required = false) Sexo sexo,
                                         @RequestParam(required = false) Porte porte,
                                         @RequestParam(required = false) Boolean idoso,
                                         @RequestParam(defaultValue = "0") int pagina,
                                         @RequestParam(defaultValue = "24") int tamanho) {
        // idosos primeiro: são os que mais precisam de visibilidade (e quase nunca são adotados)
        var ordem = Sort.by(Sort.Order.desc("idoso"), Sort.Order.asc("nome"));
        var pageable = PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, 48), ordem);
        return animais.listarVitrine(especie, sexo, porte, idoso, pageable).map(AnimalPublicoResponse::de);
    }

    @GetMapping("/{slug}")
    AnimalPublicoResponse buscar(@PathVariable String slug) {
        return animais.buscarVitrinePorSlug(slug)
                .map(AnimalPublicoResponse::de)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Animal não encontrado: " + slug));
    }
}
