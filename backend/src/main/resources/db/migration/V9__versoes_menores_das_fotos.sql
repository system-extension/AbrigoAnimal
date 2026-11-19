-- Versões menores de cada foto (média e mini), geradas no envio (ADR 0015).
-- false = a foto só tem o arquivo original (enviada antes desta mudança, ou o Java não conseguiu
-- ler a imagem): as telas usam o original no lugar das versões.
alter table foto_animal add column com_versoes boolean not null default false;
