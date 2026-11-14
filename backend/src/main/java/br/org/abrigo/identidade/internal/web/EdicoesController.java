package br.org.abrigo.identidade.internal.web;

import br.org.abrigo.identidade.internal.EdicoesEmAndamento;
import br.org.abrigo.identidade.internal.EdicoesEmAndamento.Editor;
import br.org.abrigo.identidade.internal.GestaoUsuarios;
import br.org.abrigo.plataforma.RegraNegocioException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Aviso de presença (ADR 0014). Exige login, como todo /api/**.
 * {recurso} é o tipo de cadastro ("animal"); {id} é o cadastro.
 */
@RestController
@RequestMapping("/api/edicoes")
class EdicoesController {

    private static final Pattern RECURSO = Pattern.compile("[a-z]{1,30}");

    private final EdicoesEmAndamento edicoes;
    private final GestaoUsuarios usuarios;

    EdicoesController(EdicoesEmAndamento edicoes, GestaoUsuarios usuarios) {
        this.edicoes = edicoes;
        this.usuarios = usuarios;
    }

    /** Sinal "estou editando", a cada 30 s. Responde quem MAIS está editando. */
    @PostMapping("/{recurso}/{id}")
    List<Editor> sinalizar(@PathVariable String recurso, @PathVariable UUID id, Authentication quem) {
        return edicoes.sinalizar(chave(recurso, id), quem.getName(), usuarios.nomeOuEmail(quem.getName()));
    }

    @DeleteMapping("/{recurso}/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void sair(@PathVariable String recurso, @PathVariable UUID id, Authentication quem) {
        edicoes.sair(chave(recurso, id), quem.getName());
    }

    private static String chave(String recurso, UUID id) {
        if (!RECURSO.matcher(recurso).matches()) {
            throw new RegraNegocioException("Tipo de cadastro inválido.");
        }
        return recurso + ":" + id;
    }
}
