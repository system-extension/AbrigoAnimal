# 0009 · Vídeos dos animais hospedados no YouTube

**Status:** aceita (2026-09-30) · migrada do Notion em 2026-11-07 (lá era a ADR-005) · **implementação adiada**
(o front tem a seção com vídeos de exemplo; com a API real ela fica escondida até existir
`GET /api/public/videos`)

## Contexto
A ONG sugeriu uma seção de vídeos. Vídeo de celular tem 50 a 150 MB por minuto, o formato do
iPhone não toca em todos os navegadores e quem assiste no 4G precisa de várias qualidades.
Hospedar isso por conta própria custaria semanas de trabalho.

## Decisão
Os vídeos ficam num **canal do YouTube da ONG**. A equipe cola o link no cadastro do animal; o
sistema guarda **só o ID do vídeo** (recusa links que não sejam do YouTube) e exibe com o player
de `youtube-nocookie.com`.

Alternativa descartada: hospedar no nosso armazenamento (upload grande, conversão, streaming
adaptativo).

## Consequências
- Custo zero; os vídeos também divulgam a ONG no YouTube
- Reversível: trocar de plataforma é trocar o player
- Depende de a ONG criar e manter o canal
- Vídeos com pessoas precisam de autorização de uso de imagem
