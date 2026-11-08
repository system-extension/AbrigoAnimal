# Como contribuir

## Onde está cada coisa
- **Quadro (kanban):** https://github.com/orgs/system-extension/projects/2
- **Requisitos, decisões e pendências com a ONG:** Notion da equipe (Documentação - Vivências 2026/2)
- **Contrato da API:** `docs/api.md`

## Organização do trabalho
- **Épicos** `[E1]`–`[E6]` agrupam as tarefas como sub-issues.
- **Sprints** são os milestones. Cada tarefa pertence a uma sprint.
- Labels:
  - Área: `backend`, `frontend`, `dados`, `infra`, `design`, `qa`
  - Prioridade: `must`, `should`, `could`
  - `decisão`: a equipe precisa decidir antes de implementar
  - `bloqueado-ong`: depende de resposta ou material da ONG

## Fluxo de uma tarefa
1. Escolha uma issue em **Todo** da sprint atual, atribua-se e mova para **In Progress**.
2. Crie a branch a partir da principal:
   - `feat/<numero>-descricao-curta` (ex.: `feat/12-cadastro-animal`)
   - `fix/<numero>-descricao-curta` para bugs
3. Commits pequenos e descritivos, no imperativo: `adiciona campo porte ao animal`.
4. Abra o PR com `Closes #<numero>` na descrição e mova a issue para **Em revisão**.
5. Pelo menos **1 revisão** de outro integrante antes do merge.
6. O CI precisa estar verde. Depois do merge, a issue vai para **Done** sozinha.

## Antes de abrir o PR
- Backend: `cd backend && ./mvnw verify` (Docker aberto)
- Frontend: `cd frontend && npm run lint && npm run build`
- Telas: confira no celular (a ONG usa o sistema pelo celular)

## Regras que não se negociam
- **Nenhum segredo no Git.** Senhas e chaves só no `.env` (que está no `.gitignore`).
- **Dados pessoais nunca na API pública.** Existe um teste que verifica isso: não o desative.
- **Telas pegam dados só de `frontend/src/api/`.** É isso que permite trocar o mock pela API sem reescrever telas.
- **Regra de negócio fica no backend.** O front valida para ajudar o usuário; quem garante é o Spring.
