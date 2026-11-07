# Guia de design — Abrigo Animal Joinville

Este é o padrão visual do front. Antes de criar ou mudar uma tela, confira aqui.
Os valores moram em `src/styles/tema.css`; este guia explica **o que cada um significa e quando usar**.
Mudou um token? Atualize as duas coisas no mesmo commit.

Referência visual (mockups): canvas "Abrigo Animal — Nova direção visual (mobile)".

## Princípios

1. **Mobile primeiro.** A ONG usa o celular para cadastrar e o público chega pelo celular (WhatsApp/Instagram). Desenhe em 360–390 px e depois amplie.
2. **Base neutra, uma cor de ação.** O fundo é quase branco; o laranja do logo é reservado para o que se pode tocar: o botão principal usa o laranja vivo; links e seleções, o laranja escuro. Se tudo é colorido, nada se destaca.
3. **Cor tem significado.** Laranja = ação. Verde = status positivo (disponível, idoso, ligado). Vermelho = perigo. Nunca troque esses papéis.
4. **Foto é a protagonista.** Cartões e fichas existem para mostrar o animal. Nada de molduras, bolhas ou formas decorativas competindo com a foto.
5. **Menos digitação.** No painel, prefira chips, botões segmentados, − / + e interruptores a campos de texto e selects.
6. **Simples de manter.** Um único arquivo de tema. Nada de camadas de override (`identidade.css`, `!important`, seletores `:not()` encadeados).

## Cores e papéis

| Token               | Valor     | Papel                                                               | Regra                                                                           |
| ------------------- | --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `--acao`            | `#F39534` | **Botão principal** (o laranja do logo)                             | Texto sempre `--acao-texto` (tinta, 7,5:1). Texto branco aqui não passa (2,3:1) |
| `--acao-hover`      | `#E8862A` | Hover do botão principal                                            | Escurece o mesmo tom; nunca inverte                                             |
| `--laranja`         | `#C2410C` | **Laranja de texto**: links, chip selecionado, ícones de ação, foco | Sobre branco/fundo (5,2:1). Não usar em erro, rótulo ou decoração               |
| `--laranja-escuro`  | `#9A3412` | Hover/pressionado da ação                                           | —                                                                               |
| `--laranja-suave`   | `#FFF1E6` | Fundo de destaque leve, chip selecionado                            | Texto em `--laranja-escuro`                                                     |
| `--laranja-logo`    | `#F39534` | Decorativo e anel de foco                                           | **Nunca** com texto branco (2,3:1)                                              |
| `--verde`           | `#3E6B3A` | **Status**: interruptor ligado, botão secundário de status          | Texto branco (6,2:1)                                                            |
| `--verde-escuro`    | `#2F5A2B` | Texto de selo "Idoso", "Disponível"                                 | Sobre `--verde-suave` (7:1)                                                     |
| `--verde-suave`     | `#E8F2E1` | Fundo de selo de status                                             | —                                                                               |
| `--perigo`          | `#B42318` | **Perigo**: excluir, óbito, erro de campo                           | Só para isso. Nunca em link ou destaque                                         |
| `--perigo-suave`    | `#FDECEA` | Fundo de botão/aviso de perigo                                      | —                                                                               |
| `--tinta`           | `#1C1B1A` | Títulos, chip de filtro ativo, avisos                               | —                                                                               |
| `--texto`           | `#2E2B29` | Corpo de texto                                                      | —                                                                               |
| `--texto-suave`     | `#6B6560` | Texto de apoio, legendas                                            | 5,5:1 sobre o fundo. Não clarear                                                |
| `--linha`           | `#E7E4DF` | Bordas e divisórias                                                 | —                                                                               |
| `--fundo`           | `#FAFAF8` | Fundo da página                                                     | —                                                                               |
| `--superficie`      | `#FFFFFF` | Cartões, campos, folhas                                             | —                                                                               |
| `--marca-terracota` | `#8A3B32` | Só existe no logotipo                                               | **Não é cor de interface**                                                      |

Contraste mínimo: **4,5:1** para texto (WCAG AA). Ao criar um par novo, meça antes (ex.: webaim.org/resources/contrastchecker).

## Tipografia

Duas famílias, auto-hospedadas (pacotes `@fontsource-variable`, sem CDN):

| Token            | Família               | Onde                                                                                           |
| ---------------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| `--fonte`        | **Plus Jakarta Sans** | Toda a interface: corpo, botões, campos, cartões, painel inteiro                               |
| `--fonte-titulo` | **Lora** (serifada)   | Só títulos de destaque do site público: `.hero-titulo`, `.titulo-secao`, `.pagina-animal-nome` |

Por que Lora e não Georgia: a Georgia não existe no Android, então o título caía numa serifa genérica no celular. A Lora tem o mesmo espírito clássico, vem embutida no site e aparece igual em qualquer aparelho. Para trocar de serifada, mude só `--fonte-titulo`.

`<em>` dentro de um título serifado vira **itálico**, sem trocar de cor. A ênfase vem do estilo, não de mais uma cor.

| Nível               | Tamanho                       | Peso        | Uso                                    |
| ------------------- | ----------------------------- | ----------- | -------------------------------------- |
| Título de página    | `clamp(2.1rem, 9vw, 3.4rem)`  | 600 (serif) | Capa da Início                         |
| Título de seção     | `clamp(1.75rem, 6vw, 2.5rem)` | 600 (serif) | `.titulo-secao`                        |
| Título de interface | 1.25–1.75rem                  | 700 (sans)  | Painel, folhas, cartões                |
| Corpo               | **1rem (16px)**               | 400         | Sempre 16 px no celular                |
| Apoio               | 0.875rem (14px)               | 500         | Metadados, dicas                       |
| Rótulo / selo       | **0.8125rem (13px)**          | 600–700     | **Mínimo absoluto.** Nada abaixo disso |

O sobretítulo (`.sobretitulo`, caixa alta acima dos títulos) é rótulo, não ação: usa `--verde-escuro`.

Campos de formulário sempre com 16 px (evita o zoom automático do iPhone).

## Espaço, forma e profundidade

- Raios: `--raio` 14 px (botões, campos, chips quadrados), `--raio-lg` 20 px (cartões, folhas). Chips de filtro e selos: `999px`.
- Sombra só em quem flutua ou se destaca do fundo (cartões, folhas, avisos). Bordas cuidam do resto.
- Toque: mínimo **44 px**; ações principais **52–56 px** (`--toque` = 48 px).
- Respiro lateral no celular: 16–20 px. Parágrafos com `line-height` 1.6.

## Componentes (classes do `tema.css`)

| Componente           | Classe                                                | Quando                                                                                                        |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Botão principal      | `.botao .botao-principal`                             | Uma ação principal por tela/área (Quero adotar, Salvar, Continuar)                                            |
| Botão secundário     | `.botao .botao-contorno`                              | Ação alternativa ao lado da principal (Apadrinhar, Voltar)                                                    |
| Botão de texto       | `.botao .botao-texto`                                 | Ação terciária, "Ver todos"                                                                                   |
| Botão de perigo      | `.botao .botao-perigo`                                | Excluir, registrar óbito. Sempre com confirmação                                                              |
| Botão verde          | `.botao .botao-verde`                                 | Só no painel: confirmação positiva e WhatsApp. No site público, a segunda ação usa `.botao-contorno`          |
| Botão grande / bloco | `.botao-grande`, `.botao-bloco`                       | Rodapé fixo e celular                                                                                         |
| Chamada de destaque  | `.botao-principal .botao-chamada`                     | **Uma por página**, para a conversão mais importante (ex.: "Quero adotar" no convite da Início)               |
| Ícone-bolha          | `<i className="fa-solid fa-arrow-right botao-bolha">` | Ícone no **fim** do botão principal vira um círculo escuro que se move no hover. Ícone no início fica simples |
| Chip de filtro       | `.chip` + `aria-pressed`                              | Filtros e escolhas de um toque                                                                                |
| Selo                 | `.selo .selo-verde` etc.                              | Status. Verde = positivo, laranja = em andamento, cinza = neutro                                              |
| Campo                | `.campo` + `.entrada`                                 | Sempre com `<label>`; dica em `.campo-dica`, erro em `.campo-erro`                                            |
| Interruptor          | `.interruptor`                                        | Sim/não (castrado, idoso, visível na vitrine)                                                                 |
| Contador             | `.contador`                                           | Idade aproximada (− / +)                                                                                      |
| Folha inferior       | `<Folha>`                                             | Menus e filtros no celular, em vez de modal                                                                   |

Regras de uso:

- Na ficha do animal e no cadastro, as ações ficam numa **barra fixa no rodapé**, ao alcance do polegar.
- **Uma ação principal por área.** Na ficha: idoso → Apadrinhar em destaque; demais → Adotar em destaque; a outra fica em contorno.
- Selo "Idoso" é status: sempre `.selo-verde`.
- Botões são pílula (`border-radius: 999px`), como chips e selos. O principal tem leve volume (luz em cima) e sombra quente; no hover sobe 1 px e escurece o mesmo tom, nunca inverte fundo e texto.
- Ícones: Font Awesome, sempre com `aria-hidden="true"`; botão só com ícone leva `aria-label`.

## Padrões editoriais (site público)

A Início é a referência do tom do site: títulos em Lora com uma ênfase em itálico, muito respiro e a foto como protagonista. Classes em `pages/publico/Inicio.css` e `paginas.css`:

| Padrão             | Classe              | Uso                                                                                             |
| ------------------ | ------------------- | ----------------------------------------------------------------------------------------------- |
| Cabeçalho de seção | `.cabeca-editorial` | Sobretítulo + título à esquerda; texto curto + `.link-editorial` à direita (empilha no celular) |
| Link editorial     | `.link-editorial`   | Ação secundária em texto sublinhado, ao lado de um botão principal                              |
| Passos numerados   | `.lista-vinculo`    | Até 3–4 passos com número "01" em Lora                                                          |
| Retrato em arco    | `.capa-retrato`     | Só na capa. Moldura sálvia do logo; uma única etiqueta (`.bilhete`) por cima                    |
| Faixa de convite   | `.convite`          | A **única** faixa colorida da página (`--verde-suave`)                                          |
| Mural polaroid     | `.mural-polaroid`   | Fotos do dia a dia com inclinação leve (±1,5°)                                                  |

Texto editorial: frases curtas, título em duas partes ("Cada um tem seu jeito. _Todos têm muito amor._"). Imagem gerada por IA leva a legenda "Imagem ilustrativa".

## Não fazer

- Criar arquivo CSS que sobrescreve o tema. Ajuste o token ou o componente aqui.
- Usar `--perigo` como cor de marca, ou `--laranja` para erro.
- Texto branco sobre `--acao`, `--laranja-logo` ou `--verde-logo`.
- Nomes genéricos em classes de página (`.vinculo`, `.capa`): todo o CSS vai num pacote só e colide. Prefixe com a página (`.inicio-vinculo`).
- Texto abaixo de 13 px, ou cinza mais claro que `--texto-suave`.
- Serifada em botão, campo, cartão ou no painel.
- Mais de uma faixa de fundo colorido por página; gradientes e formas decorativas atrás das fotos.
- `!important` (exceto no bloco de `prefers-reduced-motion`).

## Acessibilidade (checklist rápido)

- `<button>` para ações, `<a>`/`<Link>` para navegação. Nunca `onClick` em `div`.
- Todo campo com `<label>`; erros ligados com `aria-invalid` e `aria-describedby`.
- Foco visível (`:focus-visible` já está no tema). Não remover `outline`.
- Imagens de animal com `alt` descritivo ("Thor, cão marrom de porte grande").
- Respeitar `prefers-reduced-motion` (já tratado no tema).
