# API · Fase 1

Base: `/api`. Erros no formato Problem Details: `{ title, status, detail, campos? }`.

## Autenticação (sessão com cookie)

1. `GET /api/auth/csrf` → gera o cookie `XSRF-TOKEN`.
2. `POST /api/auth/login` (form-urlencoded: `username`, `password`) com header `X-XSRF-TOKEN` = valor do cookie → `204`.
3. Todo `POST/PUT/DELETE` interno envia o header `X-XSRF-TOKEN`.
4. `GET /api/auth/me` → usuário logado (`401` se não houver sessão).
5. `POST /api/auth/logout` → `204`.

## Interna (exige login)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/animais?busca&especie&situacao&ala&idoso&semFoto&pagina&tamanho` | Lista paginada (padrão 20, máx. 50). `busca` procura nome e os dois chips |
| GET | `/api/animais/{id}` | Detalhe |
| POST | `/api/animais` | Cadastrar (corpo abaixo) |
| PUT | `/api/animais/{id}` | Editar (enviar `versao`; `409` se alguém salvou antes) |
| POST | `/api/animais/{id}/situacao` | `{situacao}`: DISPONIVEL, EM_TRATAMENTO, ADOTADO |
| POST | `/api/animais/{id}/obito` | `{data}` (estado final, sai da vitrine) |
| POST | `/api/animais/{id}/vitrine` | `{visivel}` |
| POST | `/api/animais/{id}/fotos` | multipart `arquivo` (JPG/PNG/WEBP, até 3 MB) |
| DELETE | `/api/animais/{id}/fotos/{fotoId}` | Remover foto |
| POST | `/api/animais/{id}/fotos/{fotoId}/principal` | Definir foto principal |
| GET/POST/PUT | `/api/pessoas`, `/api/pessoas/{id}` | Cadastro de pessoas (`?busca=` por nome, e-mail, telefone) |
| GET | `/api/apadrinhamentos?animalId=` ou `?pessoaId=` | Padrinhos do animal / afilhados da pessoa |
| POST | `/api/apadrinhamentos` | `{pessoaId, animalId, tipoApoio, dataInicio?, observacoes?}` |
| POST | `/api/apadrinhamentos/{id}/encerrar` | `{dataFim?}` |
| POST | `/api/apadrinhamentos/{id}/tipo-apoio` | `{tipoApoio}`: AFETIVO, FINANCEIRO, AMBOS |
| GET | `/api/solicitacoes?status&pagina&tamanho` | Caixa de solicitações |
| POST | `/api/solicitacoes/{id}/status` | `{status, observacao?}`: NOVA, EM_CONTATO, CONCLUIDA, DESCARTADA |
| GET/POST | `/api/usuarios` | Usuários da equipe |
| POST | `/api/usuarios/{id}/desativar` | Desativar usuário |

## Pública (sem login)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/public/animais?especie&sexo&porte&idoso&pagina&tamanho` | Vitrine (padrão 24, máx. 48; idosos primeiro) |
| GET | `/api/public/animais/{slug}` | Página do animal |
| POST | `/api/public/solicitacoes` | `{tipo, animalSlug?, nome, telefone?, email?, mensagem?, consentimento: true, site: ""}` → `{protocolo}` |
| GET | `/animais/{slug}` | HTML com meta tags Open Graph (prévia no WhatsApp) |
| GET | `/arquivos/{chave}` | Fotos |

> O campo `site` do formulário é uma **isca para robôs**: deve existir escondido no HTML e ficar vazio.

## Corpo do animal (POST/PUT `/api/animais`)

```json
{
  "nome": "Biscoito", "especie": "CAO", "sexo": "MACHO", "cor": "Caramelo", "porte": "MEDIO",
  "dataNascimentoEstimada": "2018-01-01", "castrado": null,
  "chip": "963003002248049", "chipAdicional": null, "ala": "Ala A", "canil": "Solto A",
  "idoso": false, "descricao": "...", "temperamento": ["Dócil", "Calmo"],
  "medicacoes": null, "condicoesSaude": null,
  "vacinas": [{ "tipo": "V8_V10", "ultimaDose": "2025-12-29" }, { "tipo": "VERMIFUGO" }],
  "versao": 0
}
```

- Obrigatórios: `nome` e `especie`. `versao` só no PUT.
- `castrado`: `true`, `false` ou `null` (não informado).
- `medicacaoContinua` é **derivado** nas respostas: `true` quando `medicacoes` está preenchido.
- `vacinas` (ADR 0010): a lista enviada **substitui** a anterior; `ultimaDose` é opcional e não pode ser futura.
  Tipos: `V8_V10`, `V3_V4`, `ANTIRRABICA`, `GRIPE_CANINA`, `VERMIFUGO`. Sem tipo repetido.
- Os dois chips são únicos no cadastro inteiro (um não pode repetir o outro, nem o de outro animal).
- Na vitrine, `vacinas` vem só com os tipos (`["ANTIRRABICA", "V8_V10"]`), sem datas; chip, ala e canil nunca aparecem.
