# API · Fase 1

Base: `/api`. Erros no formato Problem Details: `{ title, status, detail, campos? }`.

## Autenticação (sessão com cookie)

1. `GET /api/auth/csrf` → gera o cookie `XSRF-TOKEN`.
2. `POST /api/auth/login` (form-urlencoded: `username`, `password`) com header `X-XSRF-TOKEN` = valor do cookie → `204`. Qualquer falha responde `401` sem corpo, **inclusive quando o acesso está bloqueado** por senhas erradas (ADR 0013): não há resposta diferente para "bloqueado".
3. Todo `POST/PUT/DELETE` interno envia o header `X-XSRF-TOKEN`.
4. `GET /api/auth/me` → usuário logado `{id, nome, email, ativo, administrador}` (`401` se não houver sessão).
5. `POST /api/auth/logout` → `204`.
6. `POST /api/auth/senha` `{senhaAtual, novaSenha}` → `204` (troca a própria senha; `422` se a atual não confere).

## Interna (exige login)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/animais?busca&especie&situacao&ala&idoso&semFoto&pagina&tamanho` | Lista paginada (padrão 20, máx. 50). `busca` procura nome e os dois chips |
| GET | `/api/animais/{id}` | Detalhe. `atualizadoPor` é o login (auditoria); `atualizadoPorNome` é o nome da pessoa para as telas (`null` se não for alguém da equipe, ex.: carga inicial) |
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
| GET | `/api/usuarios` | Usuários da equipe (por nome). **Todas as rotas `/api/usuarios` são só do administrador** (`403` para os demais) |
| POST | `/api/usuarios` | `{nome, email, senha}` (senha de 8 a 72 caracteres; nasce com perfil equipe) |
| POST | `/api/usuarios/{id}/desativar` | Desativar (não vale para o próprio usuário) |
| POST | `/api/usuarios/{id}/reativar` | Reativar |
| POST | `/api/edicoes/{tipo}/{id}` | Aviso de presença (ADR 0014): "estou editando", a cada 30 s. Devolve quem mais está editando: `[{nome, desde}]`. Some sem sinal por 2 min |
| DELETE | `/api/edicoes/{tipo}/{id}` | Saí da edição |
| POST | `/api/usuarios/{id}/desbloquear` | Libera quem foi bloqueado por senhas erradas, em todas as redes (`422` para o administrador). A lista traz `bloqueado: true/false` |
| POST | `/api/usuarios/{id}/senha` | `{novaSenha}`: senha provisória para quem esqueceu (não vale para o próprio usuário) |

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
