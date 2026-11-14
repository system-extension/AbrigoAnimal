package br.org.abrigo.identidade.internal;

import br.org.abrigo.identidade.internal.domain.Usuario;
import br.org.abrigo.identidade.internal.persistence.UsuarioRepository;
import br.org.abrigo.plataforma.NomesDaEquipe;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/** Nomes vêm do cadastro da equipe (o nome que o administrador digitou ao adicionar a pessoa). */
@Component
class NomesDaEquipeCadastrados implements NomesDaEquipe {

    private final UsuarioRepository usuarios;

    NomesDaEquipeCadastrados(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<String> nomeDe(String login) {
        return login == null ? Optional.empty() : usuarios.findByEmailIgnoreCase(login).map(Usuario::getNome);
    }
}
