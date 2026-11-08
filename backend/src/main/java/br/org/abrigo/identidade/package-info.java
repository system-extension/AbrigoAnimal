/**
 * Usuários da equipe da ONG, login por sessão (cookie) e configuração de segurança.
 * Cada pessoa tem seu login (P-04). Dois perfis: administrador e equipe (ADR 0012).
 * Login protegido contra força bruta (ADR 0013).
 */
@org.springframework.modulith.ApplicationModule(
        displayName = "Identidade",
        allowedDependencies = {"plataforma"})
package br.org.abrigo.identidade;
