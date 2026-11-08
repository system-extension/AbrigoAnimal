-- Perfil de administrador (ADR 0012): só ele gerencia a equipe (adicionar, desativar,
-- reativar, senha provisória). Os demais usam o painel normalmente e trocam a própria senha.
alter table usuario add column administrador boolean not null default false;

-- Bancos que já existem: o primeiro usuário (o criado a partir de ADMIN_EMAIL) vira o administrador.
update usuario
   set administrador = true
 where id = (select id from usuario order by criado_em limit 1);
