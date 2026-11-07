-- Vacinas e vermífugo (planilhas "CONTROLE DE VACINA" da ONG).
-- Cada aplicação é uma linha: guarda o HISTÓRICO que a planilha perdia ao sobrescrever a célula.
create table cuidado (
    id             uuid primary key,
    versao         bigint       not null,
    organizacao_id bigint       not null references organizacao (id),
    animal_id      uuid         not null references animal (id) on delete cascade,
    tipo           varchar(20)  not null,
    aplicado_em    date         not null,
    -- Gravado (não calculado): o padrão é +1 ano, mas há exceções (reforço de filhote, ajuste do veterinário).
    proximo_em     date,
    -- Aplicações feitas "na ala inteira" no mesmo registro compartilham o lote.
    lote_id        uuid,
    observacao     varchar(200),
    criado_em      timestamptz  not null,
    atualizado_em  timestamptz  not null,
    criado_por     varchar(150) not null,
    atualizado_por varchar(150) not null,
    constraint ck_cuidado_tipo  check (tipo in ('V8', 'RAIVA', 'VERMIFUGO')),
    constraint ck_cuidado_datas check (proximo_em is null or proximo_em > aplicado_em)
);

-- "Última aplicação de cada tipo por animal" (painel e vitrine).
create index ix_cuidado_animal  on cuidado (animal_id, tipo, aplicado_em desc);
create index ix_cuidado_lote    on cuidado (lote_id) where lote_id is not null;
