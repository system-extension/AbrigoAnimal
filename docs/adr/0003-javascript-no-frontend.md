# 0003 · JavaScript (não TypeScript) no frontend

**Status:** aceita (2026-09-22) · migrada do Notion em 2026-11-07

## Contexto
Prazo curto (entrega em novembro) e a equipe já domina React + JavaScript.

## Decisão
Frontend em **React + Vite + JavaScript** (`.jsx`).

Como compensamos a falta de tipos: o backend é a fonte da verdade nas validações; ESLint e
Prettier no CI; a camada `src/api` documenta o formato de cada resposta (JSDoc).

## Consequências
- Velocidade desde o primeiro dia
- Erros de tipo só aparecem ao rodar
- Reversível: dá para migrar para TypeScript aos poucos, arquivo por arquivo
