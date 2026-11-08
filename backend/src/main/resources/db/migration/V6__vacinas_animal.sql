-- Vacinas que o animal JÁ TOMOU, registradas no cadastro (opção B, decidida em 07/11/2026).
-- Não é gestão de vacinas: sem histórico, sem próxima dose, sem alertas.
-- Uma linha por animal + tipo; a data da última dose é opcional (nem sempre se sabe).
create table vacina_animal (
    animal_id   uuid        not null references animal (id) on delete cascade,
    tipo        varchar(20) not null,
    ultima_dose date,
    primary key (animal_id, tipo),
    constraint ck_vacina_animal_tipo
        check (tipo in ('V8_V10', 'V3_V4', 'ANTIRRABICA', 'GRIPE_CANINA', 'VERMIFUGO'))
);
