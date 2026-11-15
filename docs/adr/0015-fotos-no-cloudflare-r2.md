# 0015 · Fotos no Cloudflare R2 (protocolo S3)

**Status:** aceita (2026-11-14). Completa a [ADR 0007](0007-armazenamento-atras-de-interface.md).

## Contexto
A ADR 0007 deixou as fotos atrás de uma interface, gravando em disco até a hospedagem ser
decidida. No Railway o disco do container some a cada deploy (dá para usar volume, mas aí as fotos
ficam presas a um servidor só, entram no backup do servidor e todo o tráfego de imagem passa pela
aplicação). O teste da imagem Docker do B4 mostrou isso na prática: o container subiu sem nenhuma foto.

## Decisão
- **Cloudflare R2** para as fotos em produção: armazenamento de objetos, plano gratuito de 10 GB e
  **sem cobrança de tráfego de saída** (o que costuma pesar na AWS S3). Conta e cartão da ONG.
- O código fala o **protocolo S3** (SDK oficial da AWS), não uma API própria da Cloudflare:
  `ArmazenamentoS3` funciona com R2, AWS S3 ou qualquer serviço compatível. Trocar de fornecedor é
  trocar variáveis de ambiente.
- Escolha por variável: `ARMAZENAMENTO_TIPO=disco` (padrão, desenvolvimento) ou `s3`.
- O banco continua guardando **só a chave** (`animais/<id>/<uuid>.webp`), igual no disco e no S3.
- Duas formas de entregar a foto, sem mudar código:
  - **sem** `ARMAZENAMENTO_URL_PUBLICA`: o navegador pede `/arquivos/...` ao backend, que busca no bucket;
  - **com** `ARMAZENAMENTO_URL_PUBLICA` (domínio próprio ligado ao bucket, ex.: `fotos.<domínio>`):
    o navegador busca direto na Cloudflare, com cache na borda.
  O deploy não depende do domínio estar pronto: começa pelo backend e passa para o domínio depois.
- A aplicação **não sobe** se faltar variável, se o bucket não existir ou se a chave não tiver
  acesso, com mensagem dizendo o que conferir.
- Desenvolvimento: servidor S3 local no `compose.yaml` (perfil `s3`) com o **Silo**, fork
  comunitário do MinIO (a imagem oficial do MinIO deixou de ser publicada no Docker Hub). Os testes
  usam a mesma imagem via Testcontainers.

## Alternativas consideradas
- **Volume do Railway:** mais simples, mas prende as fotos a um servidor, pesa no backup e no
  tráfego da aplicação, e não tem CDN.
- **Fotos no banco (bytea):** banco e backup crescem com cada foto; descartado.
- **AWS S3:** mesmo código serviria; descartado pelo custo de saída e por exigir mais uma conta
  com cobrança em dólar sem plano gratuito permanente.

## Consequências
- Mais uma conta para a ONG (Cloudflare), com o Ítalo como membro técnico (sem acesso à cobrança).
- As chaves de acesso do R2 ficam só nas variáveis do Railway; o token é limitado a leitura e
  escrita **neste bucket**.
- Backup das fotos passa a ser cópia do bucket (B9).
- Endereço público direto exige o DNS do domínio da ONG na Cloudflare. O `r2.dev` (endereço de
  teste da Cloudflare) não é usado em produção.
