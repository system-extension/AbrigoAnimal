# 0012 · Perfil de administrador para gerenciar a equipe

**Status:** aceita (2026-11-08)

## Contexto
Até aqui toda a equipe tinha o mesmo acesso (RN-62). Com a tela Equipe, isso significava que
qualquer voluntário podia definir uma senha provisória para outro, **inclusive para quem
administra o sistema**, e assim entrar como ele, além de adicionar ou desativar pessoas.
O teste de homologação mostrou o problema: um usuário comum conseguia trocar a senha do administrador.

## Decisão
- Dois perfis: **administrador** e **equipe**. Coluna `usuario.administrador` (migração V7).
- Só o administrador acessa `/api/usuarios/**` (listar, adicionar, desativar, reativar, senha
  provisória). A regra fica no `SegurancaConfig` (`hasRole("ADMIN")`): a tela só esconde.
- Todo mundo troca a **própria** senha (`/api/auth/senha`), informando a atual.
- Quem nasce administrador: o primeiro usuário (`ADMIN_EMAIL`/`ADMIN_SENHA`). Em bancos que já
  existiam, a V7 promove o usuário mais antigo. Quem é adicionado pela tela nasce como equipe.
- Sem tela para promover ou rebaixar: um administrador só, a pessoa que responde pelo sistema.

## Consequências
- O perfil entra no login: quem já estava logado precisa sair e entrar de novo para ganhar ou
  perder o acesso de administrador.
- Se o administrador esquecer a senha, ninguém pela tela consegue redefinir. Recuperação:
  gerar um hash BCrypt e atualizar `usuario.senha_hash` direto no banco (procedimento a
  documentar no guia de produção, junto com o deploy). Se a ONG quiser um segundo
  administrador, é uma tela pequena a mais.
