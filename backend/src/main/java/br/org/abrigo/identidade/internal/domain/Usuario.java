package br.org.abrigo.identidade.internal.domain;

import br.org.abrigo.plataforma.EntidadeBase;
import br.org.abrigo.plataforma.RegraNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Locale;
import java.util.regex.Pattern;

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
        u.email = validarFormato(normalizarEmail(email));
        u.senhaHash = senhaHash;
        u.ativo = true;
        u.administrador = administrador;
        return u;
    }

    /**
     * Formato de e-mail para quem entra na equipe: algo@dominio.ext, sem espaços.
     * Mais rígido que o @Email do Jakarta, que aceita "maria@abrigo" (sem o ".com").
     * Não confere se a caixa existe (o sistema não envia e-mails); só barra erros de digitação.
     */
    private static final Pattern FORMATO_EMAIL =
            Pattern.compile("^[^@\\s]+@[^@\\s.]+(\\.[^@\\s.]+)*\\.[a-z][a-z0-9-]+$");

    static String validarFormato(String email) {
        if (email.length() > 254 || !FORMATO_EMAIL.matcher(email).matches()) {
            throw new RegraNegocioException("E-mail inválido. Confira se está completo, por exemplo: nome@gmail.com");
        }
        return email;
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
