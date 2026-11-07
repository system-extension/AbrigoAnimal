# 0006 · Sessão com cookie em vez de JWT

**Status:** aceita (2026-09-26)

## Contexto
Front e API no mesmo domínio (um deploy). Poucos usuários. Precisamos bloquear o acesso
de quem sair da ONG (P-04).

## Decisão
Spring Security com `formLogin` em `/api/auth/login`, sessão em cookie `httpOnly` (`SameSite=Lax`,
`Secure` em produção) e proteção CSRF com `CookieCsrfTokenRepository` (cookie `XSRF-TOKEN` →
header `X-XSRF-TOKEN`). O formulário público (`/api/public/**`) fica fora do CSRF (não há sessão).

## Consequências
- O JavaScript não tem acesso ao cookie de sessão (protege contra XSS roubar o login)
- Sair = invalidar a sessão no servidor; desativar usuário impede novos logins
- Menos código que JWT (sem refresh token, sem armazenamento no navegador)
- Sessão fica na memória da instância: com mais de uma instância seria preciso Spring Session (não é o caso)
