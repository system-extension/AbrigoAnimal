# Guia do frontend

## Estrutura

```
src/
├── api/                 ← ÚNICA camada que conhece o backend
│   ├── cliente.js       fetch com cookie de sessão, CSRF, erros padronizados e aviso de "dados alterados"
│   ├── rotulos.js       códigos do backend → textos da tela (CAO → "Cão")
│   ├── vitrine.js       público: lista e página do animal
│   ├── solicitacoes.js  formulário de interesse + caixa de pedidos
│   ├── animais.js       painel: cadastro, situação, óbito, vitrine, fotos
│   ├── pessoas.js       painel: padrinhos (cadastro único de pessoas)
│   ├── apadrinhamentos.js
│   └── auth.js          login da equipe
├── components/
│   ├── layout/          cabeçalho, rodapé, layout público e do painel
│   ├── pets/            cartão e foto do animal
│   ├── painel/          seletor de fotos do cadastro
│   └── ui/              campos, chips, folha (bottom sheet), carregando, vazio
├── context/             sessão da equipe e avisos (toasts)
├── hooks/useCarregar.js carregando / dados / erro de toda tela
├── pages/publico/       Início, Animais, Animal, Interesse, Como ajudar, Sobre, Denúncia, Privacidade
├── pages/painel/        Entrar, Início, Animais, Formulário do animal, Pedidos, Padrinhos
├── styles/tema.css      identidade visual (cores, botões, chips, campos)
└── utils/               contato da ONG, compressão de fotos, máscaras
```

Fluxo: `index.html → main.jsx → App.jsx (rotas) → página → componentes → src/api`.

## Rotas

| Rota                                                  | Tela                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/`                                                   | Início: idosos em destaque, como funciona o apadrinhamento, Rolê do Abrigo            |
| `/animais`                                            | Vitrine com filtros (idosos, cães, gatos, sexo) guardados na URL                      |
| `/animais/:slug`                                      | Página do animal. **Mesma rota** que o backend usa para a prévia com foto no WhatsApp |
| `/animais/:slug/interesse?tipo=APADRINHAR`            | Formulário de interesse, **sem conta**                                                |
| `/quero-ajudar`                                       | Mesmo formulário, sem animal                                                          |
| `/como-ajudar`, `/sobre`, `/denuncia`, `/privacidade` | Institucionais                                                                        |
| `/painel/entrar`                                      | Login da equipe                                                                       |
| `/painel`                                             | Resumo do dia: números, pedidos novos, animais sem foto                               |
| `/painel/animais`                                     | Lista com busca e filtros                                                             |
| `/painel/animais/novo` e `/painel/animais/:id`        | Cadastro/edição                                                                       |
| `/painel/solicitacoes`                                | Caixa de pedidos (Nova → Em contato → Concluída/Descartada)                           |
| `/painel/padrinhos`                                   | Pessoas e afilhados                                                                   |

Rotas antigas do protótipo (`/home`, `/catalogo`, `/pets/:id`, `/termos`, `/admin`) redirecionam.

## Decisões de UX

**Cadastro de animal (feito pelo celular, no abrigo):**

- **Foto primeiro.** Botão "Tirar foto" abre a câmera traseira; "Galeria" aceita várias de uma vez.
- **Compressão no celular** (`utils/imagem.js`): ~5 MB viram ~300 KB antes de subir.
- **Só nome e espécie são obrigatórios.** O resto pode ser completado depois.
- **Chips em vez de listas** (espécie, sexo, porte, ala, vacinas, temperamento): um toque, sem abrir menu.
- **Idade com − / +** em vez de data; o sistema converte para a data estimada do backend. Sugere marcar como idoso a partir de 8 anos (cães) ou 10 (gatos), mas a decisão é da equipe.
- **Botão Salvar fixo no rodapé**, sempre ao alcance do polegar. Atalhos para as seções no topo.
- **Rascunho automático**: se a tela fechar no meio, o cadastro continua de onde parou (fotos não entram no rascunho).
- **Situação e óbito** mudam na hora, com confirmação para o óbito (definitivo).
- Depois de cadastrar: "Cadastrar outro" com um toque.

**Painel:** abas no rodapé (padrão de app) com botão central de cadastro; no computador viram barra lateral.

**Vídeos:** só a capa aparece; nada é baixado até a pessoa tocar no play (economiza dados no 4G). Vídeo do YouTube toca pelo `youtube-nocookie.com`.

**Site público:** vitrine com idosos primeiro; botões Apadrinhar/Adotar fixos no rodapé da página do animal; formulário sem conta; compartilhamento nativo do celular.

## Identidade visual

O padrão visual (cores e seus papéis, tipografia, componentes e regras de uso) está em **[DESIGN.md](./DESIGN.md)**. Os valores ficam em `src/styles/tema.css`.

## Ligando ao backend

Não há configuração: o front sempre fala com a API ([ADR 0011](../../docs/adr/0011-fim-do-modo-demonstracao.md)).

1. Backend rodando em `localhost:8080` (o Vite repassa `/api` e `/arquivos`).
2. Usuário da equipe: o primeiro é criado a partir de `ADMIN_EMAIL`/`ADMIN_SENHA` no backend.
3. Dados para testar as telas: `backend/scripts/dados-teste.sql` (fictícios; `limpar-dados-teste.sql` remove).

Depois de toda gravação bem-sucedida, `cliente.js` dispara `EVENTO_DADOS` e o `useCarregar` de cada
tela aberta busca de novo, sem piscar. Não é preciso chamar `recarregar()` só para atualizar a lista.

| Item                                       | Situação                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| Idade e nº de padrinhos na lista do painel | O backend (`AnimalListagem`) ainda não devolve; a tela esconde quando não vem |
| Lista "todos os apadrinhamentos"           | Não existe no backend; a tela usa `?pessoaId=` e `?animalId=`, que existem    |

Listas longas (vitrine e animais do painel) são paginadas no backend; a tela usa `usePaginacao` + `<CarregarMais>`.

Vacinas (ADR 0010): o cadastro registra só quais vacinas o animal tomou e a data da última dose (opcional). Não há gestão de vacinas.

## Pendências

- Confirmar o **WhatsApp da ONG** em `src/utils/contato.js`.
- Revisar o texto de **Privacidade** com a ONG.
- Imagens geradas por IA (Rolê, Sobre) estão marcadas como "Imagem ilustrativa": trocar por fotos reais quando houver.
- Vídeos (ADR 0009): a seção já existe na tela (início e página do animal) e toca vídeos do YouTube. Falta o backend guardar o ID do vídeo e a rota `GET /api/public/videos`; até lá a seção fica escondida.
- PWA (instalar como app) e testes automatizados (Vitest/Playwright).
