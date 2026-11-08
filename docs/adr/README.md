# Decisões do projeto (ADRs)

Cada decisão importante vira um arquivo curto: **contexto → decisão → consequências**.
O número segue a **ordem cronológica** das decisões. Decisões não se apagam: se mudarem, cria-se
uma nova que **substitui** a anterior (e a antiga ganha "Status: substituída por NNNN").
Para criar uma nova: copie a última e use o próximo número.

Ficam aqui, versionadas junto com o código, as decisões de escopo **e** as técnicas.
Até 07/11/2026 as de escopo ficavam no Notion (ADR-001 a ADR-005); ao migrar, todas foram
renumeradas por data. Correspondência: Notion 001–004 = 0001–0004; Notion 005 (vídeos) = 0009.

| # | Decisão | Data | Tipo |
|---|---|---|---|
| [0001](0001-primeira-entrega.md) | Primeira entrega: animais + apadrinhamento + vitrine | 22/09/2026 | escopo |
| [0002](0002-financeiro-fora-do-escopo.md) | Gestão financeira fora do escopo | 22/09/2026 | escopo |
| [0003](0003-javascript-no-frontend.md) | JavaScript (não TypeScript) no frontend | 22/09/2026 | técnica |
| [0004](0004-escopo-da-entrega-de-novembro.md) | Escopo da entrega de novembro | 26/09/2026 | escopo |
| [0005](0005-monolito-modular.md) | Monólito modular com Spring Modulith, um único deploy | 26/09/2026 | técnica |
| [0006](0006-sessao-com-cookie.md) | Autenticação por sessão (cookie httpOnly + CSRF), não JWT | 26/09/2026 | técnica |
| [0007](0007-armazenamento-atras-de-interface.md) | Fotos atrás de uma interface; disco agora, R2/S3 depois | 26/09/2026 | técnica |
| [0008](0008-java-25.md) | Java 25 (LTS) | 27/09/2026 | técnica |
| [0009](0009-videos-no-youtube.md) | Vídeos dos animais no YouTube (implementação adiada) | 30/09/2026 | escopo |
| [0010](0010-vacinas-no-cadastro.md) | Vacinas registradas no cadastro do animal, sem gestão de vacinas | 07/11/2026 | escopo |
| [0011](0011-fim-do-modo-demonstracao.md) | Fim do modo demonstração: todos os dados vêm do banco | 08/11/2026 | técnica |
| [0012](0012-perfil-administrador.md) | Perfil de administrador para gerenciar a equipe | 08/11/2026 | técnica |

Próxima: **0013 · hospedagem de produção (Railway)**.
