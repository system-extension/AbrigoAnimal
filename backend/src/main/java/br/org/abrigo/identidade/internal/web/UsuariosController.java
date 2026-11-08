package br.org.abrigo.identidade.internal.web;

import br.org.abrigo.identidade.internal.GestaoUsuarios;
import br.org.abrigo.identidade.internal.GestaoUsuarios.UsuarioResposta;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
class UsuariosController {

    private final GestaoUsuarios gestao;

    UsuariosController(GestaoUsuarios gestao) {
        this.gestao = gestao;
    }

    @GetMapping
    List<UsuarioResposta> listar() {
        return gestao.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    UsuarioResposta criar(@Valid @RequestBody NovoUsuarioRequest req) {
        return gestao.criar(req.nome(), req.email(), req.senha());
    }

    @PostMapping("/{id}/desativar")
    UsuarioResposta desativar(@PathVariable UUID id, Authentication autenticacao) {
        return gestao.desativar(id, autenticacao.getName());
    }

    @PostMapping("/{id}/reativar")
    UsuarioResposta reativar(@PathVariable UUID id) {
        return gestao.reativar(id);
    }

    /** Senha provisória para quem esqueceu a sua (ver GestaoUsuarios.redefinirSenha). */
    @PostMapping("/{id}/senha")
    UsuarioResposta redefinirSenha(@PathVariable UUID id, @Valid @RequestBody NovaSenhaRequest req,
                                   Authentication autenticacao) {
        return gestao.redefinirSenha(id, req.novaSenha(), autenticacao.getName());
    }

    record NovoUsuarioRequest(
            @NotBlank(message = "Informe o nome") @Size(max = 150) String nome,
            @NotBlank(message = "Informe o e-mail") @Email(message = "E-mail inválido") String email,
            @NotBlank(message = "Informe a senha") @Size(min = 8, max = 72, message = "A senha precisa ter entre 8 e 72 caracteres") String senha) {
    }

    record NovaSenhaRequest(
            @NotBlank(message = "Informe a nova senha") @Size(min = 8, max = 72, message = "A senha precisa ter entre 8 e 72 caracteres") String novaSenha) {
    }
}
