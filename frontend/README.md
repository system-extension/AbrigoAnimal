# Frontend · Abrigo Animal Joinville

Site público (vitrine, apadrinhamento, como ajudar) e painel da equipe da ONG.
React 19 + Vite, JavaScript ([ADR-003](../docs/adr)). Pensado primeiro para o celular.

## Rodar

Requer Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O painel fica em `/painel`.

## Dois modos

| Modo                      | Como ligar                                                                                                                      | De onde vêm os dados                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Demonstração** (padrão) | nada a fazer                                                                                                                    | Do próprio navegador (`src/api/mock`). Login: `equipe@abrigo.local` / `abrigo123` |
| **API real**              | `frontend/.env.local` com `VITE_API_REAL=vitrine` (só o site público) ou `VITE_USAR_API=true` (tudo), e o backend na porta 8080 | Do Spring Boot (`/api/...`)                                                       |

As telas não sabem em qual modo estão: elas só chamam funções de `src/api/`. Trocar de modo não exige mexer em tela.

## Comandos

| Comando          | Para quê                                                        |
| ---------------- | --------------------------------------------------------------- |
| `npm run dev`    | Servidor de desenvolvimento (com proxy de `/api` para o Spring) |
| `npm run lint`   | Confere o código (rodar antes de abrir PR)                      |
| `npm run build`  | Gera a versão de produção em `dist/`                            |
| `npm run format` | Formata com Prettier                                            |

## Mais detalhes

[docs/GUIA_FRONTEND.md](docs/GUIA_FRONTEND.md): estrutura, telas, decisões de UX, como ligar ao backend e pendências.
