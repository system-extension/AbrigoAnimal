package br.org.abrigo.identidade.internal.domain;

import br.org.abrigo.plataforma.EntidadeBase;
import br.org.abrigo.plataforma.RegraNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Locale;

@Entity
@Table(name = "usuario")
public class Usuario extends EntidadeBase {

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(nullable = false, length = 200)
    private String senhaHash;

    @Column(nullable = false)
    private boolean ativo;

    /** Administra a equipe (ADR 0012). Os demais só usam o painel e trocam a própria senha. */
    @Column(nullable = false)
    private boolean administrador;

    protected Usuario() {
        // exigido pelo JPA
    }

    /** Usuário comum da equipe. */
    public static Usuario criar(String nome, String email, String senhaHash) {
        return novo(nome, email, senhaHash, false);
    }

    /** Administrador: só o primeiro usuário nasce assim (AdminInicial). */
    public static Usuario criarAdministrador(String nome, String email, String senhaHash) {
        return novo(nome, email, senhaHash, true);
    }

    private static Usuario novo(String nome, String email, String senhaHash, boolean administrador) {
        if (nome == null || nome.isBlank()) {
            throw new RegraNegocioException("Nome do usuário é obrigatório.");
        }
        Usuario u = new Usuario();
        u.nome = nome.trim();
        u.email = normalizarEmail(email);
        u.senhaHash = senhaHash;
        u.ativo = true;
        u.administrador = administrador;
        return u;
    }

    public static String normalizarEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new RegraNegocioException("E-mail do usuário é obrigatório.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public void desativar() {
        this.ativo = false;
    }

    public void reativar() {
        this.ativo = true;
    }

    public void alterarSenha(String novoHash) {
        this.senhaHash = novoHash;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public boolean isAdministrador() {
        return administrador;
    }
}
