# 0007 · Armazenamento de fotos atrás de uma interface

**Status:** aceita (2026-09-26)

## Contexto
A hospedagem ainda não foi decidida (Railway/Neon/R2, AWS pela universidade ou créditos para ONG).

## Decisão
`ArmazenamentoArquivos` (módulo plataforma) é uma interface. A implementação atual grava em disco
(`ArmazenamentoLocal`, pasta configurável). Quando a hospedagem for escolhida, uma implementação
para Cloudflare R2/S3 substitui a local, sem mudar nenhum módulo de negócio.
As fotos já chegam comprimidas do celular; o servidor valida o tipo pela assinatura dos bytes.

## Consequências
- Desenvolvimento local sem conta em nenhum serviço
- Em produção com disco efêmero, as fotos se perdem ao reiniciar: **trocar para R2/S3 antes de ir para produção**
  (ou usar volume persistente)
