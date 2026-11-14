# 0011 · Fim do modo demonstração: todos os dados vêm do banco

**Status:** aceita (2026-11-08)

## Contexto
O front nasceu antes do backend com um "backend de mentira" no navegador (`src/api/mock`):
animais, pessoas, pedidos e vídeos de exemplo guardados no `localStorage`/IndexedDB. Serviu para
desenhar as telas e para a demonstração na Vercel enquanto a API não existia, e cada área era
ligada ao backend por variável (`VITE_API_REAL`, `VITE_USAR_API`).

Com o backend completo e os dados reais carregados, o mock passou a atrapalhar:
- **esconde bugs**: o mock aceitava o que o backend recusa ou ignora (ex.: o painel mandava
  `consentimento` e a API espera `consentiu`, e o consentimento do padrinho nunca era gravado);
- **comportamento diferente**: as listas se atualizavam sozinhas só no mock (bug da caixa de pedidos);
- **duas verdades**: dados de exemplo no navegador × dados no banco, e uma variável de ambiente
  que, esquecida, publica um site com dados falsos.

## Decisão
- O front só conversa com a API. Removidos `src/api/mock/`, `src/api/config.js`, os vídeos de
  exemplo e as variáveis `VITE_API_REAL`/`VITE_USAR_API`.
- Dados para testar e homologar são **fictícios, no banco**, criados por SQL:
  `backend/scripts/dados-teste.sql` (marcados com `criado_por = 'dados-teste'`) e removidos por
  `backend/scripts/limpar-dados-teste.sql`. Nunca em produção.

## Consequências
- Para rodar o front é preciso o backend (`docker compose` + Spring). Sem ele, as telas mostram erro.
- A demonstração na Vercel acabou (lá não há API): saíram o `frontend/vercel.json` e o `VITE_BASE`
  do `vite.config.js`. A hospedagem é única, front + API na mesma origem
  ([0005](0005-monolito-modular.md), [0006](0006-sessao-com-cookie.md)).
- O aviso "dados alterados", que antes vinha do mock, agora sai do `cliente.js` depois de toda
  gravação bem-sucedida: qualquer lista aberta se recarrega sozinha.
- Vídeos (ADR [0009](0009-videos-no-youtube.md)) ficam escondidos até existir a rota no backend.
