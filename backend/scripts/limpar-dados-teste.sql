-- =============================================================================
-- Apaga TUDO o que dados-teste.sql criou (criado_por = 'dados-teste').
-- Não toca nos dados reais. Pode rodar mesmo que os dados de teste já não existam.
--
--   docker compose cp backend/scripts/limpar-dados-teste.sql postgres:/tmp/limpar-dados-teste.sql
--   docker compose exec postgres psql -U abrigo -d abrigo -v ON_ERROR_STOP=1 -f /tmp/limpar-dados-teste.sql
--
-- A ordem importa por causa das chaves estrangeiras: primeiro quem aponta, depois quem é apontado.
-- Também apaga vínculos/pedidos que alguém tenha criado pela tela em cima dos animais e pessoas de teste.
-- Vacinas e fotos saem junto com o animal (on delete cascade). Arquivos de foto enviados pela tela
-- para um animal de teste ficam na pasta de arquivos: apague-os à mão se quiser.
-- =============================================================================

begin;

delete from solicitacao
 where criado_por = 'dados-teste'
    or animal_id in (select id from animal where criado_por = 'dados-teste');

delete from apadrinhamento
 where criado_por = 'dados-teste'
    or animal_id in (select id from animal where criado_por = 'dados-teste')
    or pessoa_id in (select id from pessoa where criado_por = 'dados-teste');

delete from pessoa where criado_por = 'dados-teste';
delete from animal where criado_por = 'dados-teste';

commit;
