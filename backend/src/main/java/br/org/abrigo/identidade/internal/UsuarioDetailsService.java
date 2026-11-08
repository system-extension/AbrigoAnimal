package br.org.abrigo.identidade.internal;

import br.org.abrigo.identidade.internal.domain.Usuario;
import br.org.abrigo.identidade.internal.persistence.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Ensina o Spring Security a buscar usuários no NOSSO banco. */
@Service
class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarios;

    UsuarioDetailsService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) {
        Usuario u = usuarios.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
        return User.withUsername(u.getEmail())
                .password(u.getSenhaHash())
                .disabled(!u.isAtivo())
                .roles(u.isAdministrador() ? new String[] {"EQUIPE", "ADMIN"} : new String[] {"EQUIPE"})
                .build();
    }
}
