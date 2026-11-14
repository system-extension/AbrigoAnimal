# Frontend · Abrigo Animal Joinville

Site público (vitrine, apadrinhamento, como ajudar) e painel da equipe da ONG.
React 19 + Vite, JavaScript ([ADR-003](../docs/adr)). Pensado primeiro para o celular.

## Rodar

Requer Node.js 20+ e o **backend rodando** em `localhost:8080` (ver o [README da raiz](../README.md)).
Todos os dados vêm do banco: não existe modo demonstração ([ADR 0011](../docs/adr/0011-fim-do-modo-demonstracao.md)).

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O painel fica em `/painel` (login com `ADMIN_EMAIL`/`ADMIN_SENHA` do backend).
O Vite repassa `/api` e `/arquivos` para o Spring, então o navegador enxerga um endereço só.

Banco vazio? Carregue dados fictícios com `backend/scripts/dados-teste.sql`.

## Comandos

| Comando          | Para quê                                                        |
| ---------------- | --------------------------------------------------------------- |
| `npm run dev`    | Servidor de desenvolvimento (com proxy de `/api` para o Spring) |
| `npm run lint`   | Confere o código (rodar antes de abrir PR)                      |
| `npm run build`  | Gera a versão de produção em `dist/`                            |
| `npm run format` | Formata com Prettier                                            |

## Mais detalhes

[docs/GUIA_FRONTEND.md](docs/GUIA_FRONTEND.md): estrutura, telas, decisões de UX, como ligar ao backend e pendências.
