package br.org.abrigo.plataforma;

import java.util.Optional;

/**
 * Traduz o login gravado na auditoria ("alterado por maria@...") para o nome da pessoa, para as
 * telas mostrarem "Maria" e não um e-mail. Quem sabe os nomes é o módulo identidade, que implementa
 * esta interface; os outros módulos dependem só dela (não conhecem o identidade).
 */
public interface NomesDaEquipe {

    /** Vazio quando o login não é de uma pessoa da equipe (ex.: a carga inicial das planilhas). */
    Optional<String> nomeDe(String login);
}
