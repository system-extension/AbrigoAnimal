create table animal (
    id                       uuid primary key,
    versao                   bigint       not null,
    organizacao_id           bigint       not null references organizacao (id),
    nome                     varchar(120) not null,
    slug                     varchar(160) not null,
    especie                  varchar(20)  not null,
    sexo                     varchar(20)  not null,
    cor                      varchar(80),
    porte                    varchar(10),
    data_nascimento_estimada date,
    -- null = não informado (as planilhas da ONG não têm esse dado; false afirmaria "não castrado")
    castrado                 boolean,
    -- Microchip: é a identidade real do animal (nomes se repetem). 3 animais têm um segundo chip
    -- aplicado quando o primeiro parou de ler; a busca procura nos dois.
    chip                     varchar(40),
    chip_adicional           varchar(40),
    -- Localização interna. NUNCA vai para a vitrine (o Asilo Osnilda é a casa da fundadora).
    ala                      varchar(40),
    canil                    varchar(40),
    -- Marcado pela equipe: as planilhas não têm data de nascimento, então não dá para calcular.
    idoso                    boolean      not null default false,
    descricao                text,
    -- Etiquetas da vitrine ("Dócil|Brincalhão"), gravadas como texto separado por "|".
    temperamento             varchar(300),
    -- Ficha descritiva pública (RF-08). Medicação preenchida = medicação contínua.
    medicacoes               text,
    condicoes_saude          text,
    situacao                 varchar(20)  not null,
    data_obito               date,
    visivel_na_vitrine       boolean      not null default true,
    criado_em                timestamptz  not null,
    atualizado_em            timestamptz  not null,
    criado_por               varchar(150) not null,
    atualizado_por           varchar(150) not null,
    constraint ck_animal_especie  check (especie in ('CAO', 'GATO')),
    constraint ck_animal_sexo     check (sexo in ('MACHO', 'FEMEA', 'INDEFINIDO')),
    constraint ck_animal_porte    check (porte in ('PEQUENO', 'MEDIO', 'GRANDE')),
    constraint ck_animal_chips    check (chip_adicional is null or chip_adicional <> chip),
    constraint ck_animal_situacao check (situacao in ('DISPONIVEL', 'EM_TRATAMENTO', 'ADOTADO', 'OBITO')),
    constraint ck_animal_obito    check (situacao <> 'OBITO' or data_obito is not null)
);

create unique index uk_animal_slug on animal (slug);
create unique index uk_animal_chip on animal (chip) where chip is not null;
create unique index uk_animal_chip_adicional on animal (chip_adicional) where chip_adicional is not null;
create index ix_animal_vitrine on animal (visivel_na_vitrine, situacao);
create index ix_animal_nome on animal (lower(nome));
create index ix_animal_ala on animal (ala);

create table foto_animal (
    id             uuid primary key,
    animal_id      uuid         not null references animal (id) on delete cascade,
    chave_arquivo  varchar(300) not null,
    principal      boolean      not null,
    ordem          integer      not null,
    adicionada_em  timestamptz  not null
);

create index ix_foto_animal_animal on foto_animal (animal_id);
