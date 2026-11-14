-- Proteção do login contra força bruta (ADR 0013).
-- Tudo aqui é permanente até alguém desbloquear: o administrador pela tela (contas comuns)
-- ou o responsável técnico direto no banco (conta do administrador e IPs inteiros).

-- Senhas erradas ainda "em aberto". Um login certo apaga as do par e-mail + IP.
create table tentativa_login (
    id    bigserial    primary key,
    email varchar(200) not null, -- como foi digitado, em minúsculas (pode nem existir no cadastro)
    ip    varchar(45)  not null, -- IPv4 ou IPv6
    em    timestamptz  not null
);
create index ix_tentativa_login_ip on tentativa_login (ip, em);
create index ix_tentativa_login_email on tentativa_login (email);

-- Bloqueios. email preenchido = só aquele e-mail naquele IP; email vazio = o IP inteiro.
create table bloqueio_login (
    id           bigserial    primary key,
    ip           varchar(45)  not null,
    email        varchar(200),
    motivo       varchar(20)  not null,
    bloqueado_em timestamptz  not null,
    constraint ck_bloqueio_login_motivo check (motivo in ('SENHAS_ERRADAS', 'VARIOS_EMAILS'))
);
create unique index uk_bloqueio_login on bloqueio_login (ip, coalesce(email, ''));
create index ix_bloqueio_login_email on bloqueio_login (email);
