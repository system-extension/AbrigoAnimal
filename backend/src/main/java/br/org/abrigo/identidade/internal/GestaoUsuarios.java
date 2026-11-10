package br.org.abrigo.identidade.internal;

import br.org.abrigo.identidade.internal.domain.Usuario;
import br.org.abrigo.identidade.internal.persistence.UsuarioRepository;
import br.org.abrigo.plataforma.RecursoNaoEncontradoException;
import br.org.abrigo.plataforma.RegraNegocioException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class GestaoUsuarios {

    static final int TAMANHO_MINIMO_SENHA = 8;
    /** Limite do BCrypt: ele só aceita até 72 bytes (letra acentuada ocupa 2). */
    static final int TAMANHO_MAXIMO_SENHA_BYTES = 72;

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final ProtecaoLogin protecao;

    GestaoUsuarios(UsuarioRepository usuarios, PasswordEncoder encoder, ProtecaoLogin protecao) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.protecao = protecao;
    }

    /** Usuário comum, adicionado pelo administrador na tela Equipe. */
    public UsuarioResposta criar(String nome, String email, String senha) {
        return resposta(usuarios.save(Usuario.criar(nome, emailLivre(email), hashValido(senha))));
    }

    /** Só para o primeiro acesso (AdminInicial): o banco ainda não tem ninguém. */
    UsuarioResposta criarAdministrador(String nome, String email, String senha) {
        return resposta(usuarios.save(Usuario.criarAdministrador(nome, emailLivre(email), hashValido(senha))));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResposta> listar() {
        List<Usuario> todos = usuarios.findAllByOrderByNomeAsc();
        Set<String> bloqueados = protecao.comBloqueio(todos.stream().map(Usuario::getEmail).toList());
        return todos.stream().map(u -> UsuarioResposta.de(u, bloqueados.contains(u.getEmail()))).toList();
    }

    /** Nome para mostrar a colegas (aviso de presença); o e-mail se não achar o usuário. */
    @Transactional(readOnly = true)
    public String nomeOuEmail(String email) {
        return usuarios.findByEmailIgnoreCase(email).map(Usuario::getNome).orElse(email);
    }

    @Transactional(readOnly = true)
    public UsuarioResposta buscarPorEmail(String email) {
        return usuarios.findByEmailIgnoreCase(email)
                .map(this::resposta)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }

    public UsuarioResposta desativar(UUID id, String emailDeQuemPediu) {
        Usuario u = carregar(id);
        if (u.getEmail().equalsIgnoreCase(emailDeQuemPediu)) {
            throw new RegraNegocioException("Você não pode desativar o seu próprio usuário.");
        }
        u.desativar();
        return resposta(u);
    }

    public UsuarioResposta reativar(UUID id) {
        Usuario u = carregar(id);
        u.reativar();
        return resposta(u);
    }

    /** A própria pessoa troca a senha: precisa confirmar a atual (quem achou o celular aberto não consegue). */
    public void trocarPropriaSenha(String email, String senhaAtual, String novaSenha) {
        Usuario u = usuarios.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        if (senhaAtual == null || !encoder.matches(senhaAtual, u.getSenhaHash())) {
            throw new RegraNegocioException("A senha atual não confere.");
        }
        validarSenha(novaSenha);
        if (encoder.matches(novaSenha, u.getSenhaHash())) {
            throw new RegraNegocioException("A nova senha precisa ser diferente da atual.");
        }
        u.alterarSenha(encoder.encode(novaSenha));
    }

    /**
     * Alguém da equipe esqueceu a senha: outra pessoa da equipe define uma provisória.
     * Não há "esqueci a senha" por e-mail (o sistema não envia e-mails). A própria senha
     * só muda por trocarPropriaSenha, que exige a atual.
     */
    public UsuarioResposta redefinirSenha(UUID id, String novaSenha, String emailDeQuemPediu) {
        Usuario u = carregar(id);
        if (u.getEmail().equalsIgnoreCase(emailDeQuemPediu)) {
            throw new RegraNegocioException("Para trocar a sua própria senha, use \"Trocar minha senha\" na tela Equipe.");
        }
        validarSenha(novaSenha);
        u.alterarSenha(encoder.encode(novaSenha));
        return resposta(u);
    }

    /**
     * Libera um colega bloqueado por senhas erradas (ADR 0013). A conta do administrador não sai
     * por aqui: é liberada pelo responsável técnico, direto no banco.
     */
    public UsuarioResposta desbloquear(UUID id) {
        Usuario u = carregar(id);
        if (u.isAdministrador()) {
            throw new RegraNegocioException("O acesso do administrador só é liberado pelo responsável técnico do sistema.");
        }
        protecao.desbloquear(u.getEmail());
        return resposta(u);
    }

    public boolean existeAlgumUsuario() {
        return usuarios.count() > 0;
    }

    private UsuarioResposta resposta(Usuario u) {
        return UsuarioResposta.de(u, !protecao.comBloqueio(List.of(u.getEmail())).isEmpty());
    }

    private String emailLivre(String email) {
        String normalizado = Usuario.normalizarEmail(email);
        if (usuarios.existsByEmailIgnoreCase(normalizado)) {
            throw new RegraNegocioException("Já existe um usuário com este e-mail.");
        }
        return normalizado;
    }

    private String hashValido(String senha) {
        validarSenha(senha);
        return encoder.encode(senha);
    }

    private Usuario carregar(UUID id) {
        return usuarios.findById(id).orElseThrow(() -> RecursoNaoEncontradoException.de("Usuário", id));
    }

    private static void validarSenha(String senha) {
        if (senha == null || senha.length() < TAMANHO_MINIMO_SENHA) {
            throw new RegraNegocioException("A senha precisa ter pelo menos " + TAMANHO_MINIMO_SENHA + " caracteres.");
        }
        if (senha.getBytes(StandardCharsets.UTF_8).length > TAMANHO_MAXIMO_SENHA_BYTES) {
            throw new RegraNegocioException("A senha está longa demais (máximo de 72 letras sem acento).");
        }
    }

    /** bloqueado: barrado no login por senhas erradas em algum IP (ADR 0013). */
    public record UsuarioResposta(UUID id, String nome, String email, boolean ativo, boolean administrador,
                                  boolean bloqueado) {
        static UsuarioResposta de(Usuario u, boolean bloqueado) {
            return new UsuarioResposta(u.getId(), u.getNome(), u.getEmail(), u.isAtivo(), u.isAdministrador(),
                    bloqueado);
        }
    }
}
