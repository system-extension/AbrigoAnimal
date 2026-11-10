package br.org.abrigo.identidade.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Cria o primeiro usuário quando o banco está vazio, a partir das variáveis
 * ADMIN_EMAIL / ADMIN_SENHA / ADMIN_NOME. Depois disso, novos usuários são
 * criados pela própria equipe na tela de usuários.
 */
@Component
class AdminInicial implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInicial.class);

    private final GestaoUsuarios gestao;
    private final String nome;
    private final String email;
    private final String senha;

    AdminInicial(GestaoUsuarios gestao,
                 @Value("${abrigo.admin.nome:Administrador}") String nome,
                 @Value("${abrigo.admin.email:}") String email,
                 @Value("${abrigo.admin.senha:}") String senha) {
        this.gestao = gestao;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (gestao.existeAlgumUsuario()) {
            return;
        }
        if (email.isBlank() || senha.isBlank()) {
            log.warn("Nenhum usuário cadastrado e ADMIN_EMAIL/ADMIN_SENHA não definidos: ninguém conseguirá entrar.");
            return;
        }
        gestao.criarAdministrador(nome, email, senha);
        log.info("Usuário administrador inicial criado: {}", email);
    }
}
