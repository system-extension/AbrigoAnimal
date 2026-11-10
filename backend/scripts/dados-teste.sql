-- =============================================================================
-- Dados de TESTE (fictícios) para desenvolvimento e homologação.
--
-- NUNCA rode em produção. Os dados reais vêm das planilhas da ONG (importar_planilhas.py).
--
-- O que tem aqui, e por quê: casos que as planilhas não cobrem e que as telas precisam mostrar.
--   animais (6)      gato, em tratamento, adotado, óbito, oculto da vitrine, idoso no Asilo,
--                    medicação contínua, vacinas com e sem data, dois chips, castrado não informado
--   pessoas (3)      com CPF e consentimento, só e-mail sem consentimento, só telefone
--   apadrinhamentos  ativos, encerrado, e um de animal que veio a óbito (histórico)
--   solicitações (5) uma em cada status, com e sem animal
--
-- Tudo é marcado com criado_por = 'dados-teste'. Para apagar: limpar-dados-teste.sql
-- Os nomes começam com "Teste" para ninguém confundir com um animal ou pessoa de verdade.
-- E-mails usam o domínio .invalid (reservado: nunca entrega). CPF 123.456.789-09 é o exemplo clássico.
-- Sem fotos: arquivo de imagem não se cria por SQL. Teste o envio de fotos pela tela.
--
-- Pode rodar quantas vezes quiser: ids fixos + "on conflict do nothing" (não duplica nada).
--
-- Como rodar (na raiz do repositório, com o docker compose no ar):
--   docker compose cp backend/scripts/dados-teste.sql postgres:/tmp/dados-teste.sql
--   docker compose exec postgres psql -U abrigo -d abrigo -v ON_ERROR_STOP=1 -f /tmp/dados-teste.sql
-- =============================================================================

begin;

-- ------------------------------------------------------------------ animais
-- slug = nome sem acento + 6 primeiros caracteres do id (mesma regra de Slugs.gerar)
insert into animal (id, versao, organizacao_id, nome, slug, especie, sexo, cor, porte,
                    data_nascimento_estimada, castrado, chip, chip_adicional, ala, canil, idoso,
                    descricao, temperamento, medicacoes, condicoes_saude, situacao, data_obito,
                    visivel_na_vitrine, criado_em, atualizado_em, criado_por, atualizado_por)
values
    ('a1000000-0000-4000-8000-000000000001', 0, 1, 'Teste Mingau', 'teste-mingau-a10000', 'GATO', 'FEMEA',
     'Branco', 'PEQUENO', '2013-05-01', true, 'TESTE0001', null, 'Ala A', 'Gatil 1', true,
     'Gata idosa e tranquila. Gosta de colo e de dormir no sol da manhã.', 'Calmo|Carente', null, null,
     'DISPONIVEL', null, true, now(), now(), 'dados-teste', 'dados-teste'),

    ('a2000000-0000-4000-8000-000000000002', 0, 1, 'Teste Pipoca', 'teste-pipoca-a20000', 'CAO', 'MACHO',
     'Caramelo', 'MEDIO', '2021-02-01', false, 'TESTE0002', null, 'Ala B', 'B3', false,
     'Chegou com uma pata machucada e já está se recuperando.', 'Brincalhão|Agitado|Bom com cães',
     'Anti-inflamatório 1x ao dia', 'Pata traseira esquerda em recuperação',
     'EM_TRATAMENTO', null, true, now(), now(), 'dados-teste', 'dados-teste'),

    ('a3000000-0000-4000-8000-000000000003', 0, 1, 'Teste Bolinha', 'teste-bolinha-a30000', 'CAO', 'FEMEA',
     'Preto', 'PEQUENO', null, true, 'TESTE0003', null, 'Ala C', 'C1', false,
     'Já foi adotada, mas continua na vitrine para apadrinhamento.', 'Dócil|Bom com crianças', null, null,
     'ADOTADO', null, true, now(), now(), 'dados-teste', 'dados-teste'),

    ('a4000000-0000-4000-8000-000000000004', 0, 1, 'Teste Faísca', 'teste-faisca-a40000', 'CAO', 'MACHO',
     'Tricolor', 'GRANDE', '2010-01-01', true, 'TESTE0004', null, 'Asilo Abrigo', 'A2', true,
     null, null, null, null,
     'OBITO', '2026-10-20', false, now(), now(), 'dados-teste', 'dados-teste'),

    ('a5000000-0000-4000-8000-000000000005', 0, 1, 'Teste Sombra', 'teste-sombra-a50000', 'CAO', 'INDEFINIDO',
     null, null, null, null, null, null, 'Ala A', null, false,
     'Recém-chegado: ainda oculto da vitrine até a equipe completar o cadastro.', null, null, null,
     'DISPONIVEL', null, false, now(), now(), 'dados-teste', 'dados-teste'),

    ('a6000000-0000-4000-8000-000000000006', 0, 1, 'Teste Paçoca', 'teste-pacoca-a60000', 'CAO', 'FEMEA',
     'Rajado', 'MEDIO', '2014-08-01', true, 'TESTE0006', 'TESTE0006B', 'Asilo Osnilda', 'O1', true,
     'Idosa, companheira e muito educada. O primeiro chip parou de ler e ela ganhou um segundo.',
     'Dócil|Calmo|Bom com gatos', 'Remédio para o coração 2x ao dia', 'Cardiopatia leve, controlada',
     'DISPONIVEL', null, true, now(), now(), 'dados-teste', 'dados-teste')
on conflict do nothing;

-- vacinas: com data, sem data (sabe que tomou, não sabe quando) e animal sem nenhuma
insert into vacina_animal (animal_id, tipo, ultima_dose)
values
    ('a1000000-0000-4000-8000-000000000001', 'V3_V4', '2026-03-10'),
    ('a1000000-0000-4000-8000-000000000001', 'ANTIRRABICA', null),
    ('a2000000-0000-4000-8000-000000000002', 'V8_V10', '2026-07-02'),
    ('a2000000-0000-4000-8000-000000000002', 'VERMIFUGO', '2026-10-01'),
    ('a6000000-0000-4000-8000-000000000006', 'V8_V10', '2025-11-15'),
    ('a6000000-0000-4000-8000-000000000006', 'ANTIRRABICA', '2025-11-15'),
    ('a6000000-0000-4000-8000-000000000006', 'GRIPE_CANINA', null)
on conflict do nothing;

-- ------------------------------------------------------------------ pessoas
-- telefone só com dígitos (DDD + número), como o sistema grava
insert into pessoa (id, versao, organizacao_id, nome, telefone, email, cpf, endereco, observacoes,
                    consentimento_em, criado_em, atualizado_em, criado_por, atualizado_por)
values
    ('b1000000-0000-4000-8000-000000000001', 0, 1, 'Teste Ana Souza', '47900000001', 'ana@exemplo.invalid',
     '12345678909', 'Rua Fictícia, 100 - Joinville/SC', 'Prefere contato por WhatsApp.',
     now(), now(), now(), 'dados-teste', 'dados-teste'),
    ('b2000000-0000-4000-8000-000000000002', 0, 1, 'Teste Bruno Lima', null, 'bruno@exemplo.invalid',
     null, null, null,
     null, now(), now(), 'dados-teste', 'dados-teste'),
    ('b3000000-0000-4000-8000-000000000003', 0, 1, 'Teste Carla Dias', '47900000003', null,
     null, null, null,
     now(), now(), now(), 'dados-teste', 'dados-teste')
on conflict do nothing;

-- ------------------------------------------------------------------ apadrinhamentos
insert into apadrinhamento (id, versao, organizacao_id, pessoa_id, animal_id, tipo_apoio, data_inicio,
                            data_fim, observacoes, criado_em, atualizado_em, criado_por, atualizado_por)
values
    -- Ana apadrinha duas (N:N)
    ('c1000000-0000-4000-8000-000000000001', 0, 1, 'b1000000-0000-4000-8000-000000000001',
     'a1000000-0000-4000-8000-000000000001', 'AFETIVO', '2026-06-01', null, 'Visita aos sábados.',
     now(), now(), 'dados-teste', 'dados-teste'),
    ('c2000000-0000-4000-8000-000000000002', 0, 1, 'b1000000-0000-4000-8000-000000000001',
     'a6000000-0000-4000-8000-000000000006', 'AMBOS', '2026-08-15', null, null,
     now(), now(), 'dados-teste', 'dados-teste'),
    -- encerrado: continua no histórico
    ('c3000000-0000-4000-8000-000000000003', 0, 1, 'b2000000-0000-4000-8000-000000000002',
     'a2000000-0000-4000-8000-000000000002', 'FINANCEIRO', '2026-01-15', '2026-09-30', null,
     now(), now(), 'dados-teste', 'dados-teste'),
    -- animal que veio a óbito: o vínculo foi encerrado na data do óbito
    ('c4000000-0000-4000-8000-000000000004', 0, 1, 'b3000000-0000-4000-8000-000000000003',
     'a4000000-0000-4000-8000-000000000004', 'AFETIVO', '2025-12-01', '2026-10-20', null,
     now(), now(), 'dados-teste', 'dados-teste')
on conflict do nothing;

-- ------------------------------------------------------------------ solicitações
insert into solicitacao (id, versao, organizacao_id, tipo, animal_id, nome, telefone, email, mensagem,
                         consentimento_em, status, observacao_interna, criado_em, atualizado_em,
                         criado_por, atualizado_por)
values
    ('e1000000-0000-4000-8000-000000000001', 0, 1, 'APADRINHAR', 'a1000000-0000-4000-8000-000000000001',
     'Teste Daniela Rocha', '47900000011', null, 'Posso visitar aos domingos?',
     now(), 'NOVA', null, now() - interval '2 hours', now() - interval '2 hours', 'dados-teste', 'dados-teste'),
    ('e2000000-0000-4000-8000-000000000002', 0, 1, 'ADOTAR', 'a6000000-0000-4000-8000-000000000006',
     'Teste Eduardo Melo', '47900000012', 'eduardo@exemplo.invalid', 'Tenho quintal grande e outro cão.',
     now(), 'EM_CONTATO', 'Liguei dia 05, volta a falar na sexta.', now() - interval '3 days', now(),
     'dados-teste', 'dados-teste'),
    ('e3000000-0000-4000-8000-000000000003', 0, 1, 'OUTRO', null,
     'Teste Fernanda Alves', null, 'fernanda@exemplo.invalid', 'Quero doar ração e cobertores.',
     now(), 'NOVA', null, now() - interval '1 day', now() - interval '1 day', 'dados-teste', 'dados-teste'),
    ('e4000000-0000-4000-8000-000000000004', 0, 1, 'APADRINHAR', 'a3000000-0000-4000-8000-000000000003',
     'Teste Gabriel Nunes', '47900000014', null, null,
     now(), 'CONCLUIDA', 'Virou padrinho afetivo.', now() - interval '10 days', now(),
     'dados-teste', 'dados-teste'),
    ('e5000000-0000-4000-8000-000000000005', 0, 1, 'ADOTAR', null,
     'Teste Helena Prado', null, 'helena@exemplo.invalid', 'teste teste',
     now(), 'DESCARTADA', 'Mensagem sem conteúdo.', now() - interval '20 days', now(),
     'dados-teste', 'dados-teste')
on conflict do nothing;

commit;
