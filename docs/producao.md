# Guia de produção (rascunho)

Procedimentos do responsável técnico no ambiente de produção (Railway). Este guia cresce junto
com o deploy (ADR 0016, a escrever): variáveis, domínio, backup e restauração entram aqui.

## Acessar o banco de produção

O banco não fica exposto na internet. Três caminhos, todos protegidos pela **sua conta Railway**
(ative a verificação em duas etapas nela):

1. **Aba Data** do serviço Postgres no painel do Railway: tabelas e um editor de SQL no navegador.
2. **CLI**: `railway connect postgres` abre o `psql` já autenticado.
3. **TCP proxy público**: só para usar um cliente como o DBeaver. Ligue, use e **desligue**.

> Antes de qualquer `delete`/`update`, rode o `select` correspondente e confira o que vai mudar.

## IP do visitante: medir no primeiro deploy (obrigatório)

O bloqueio de login e o antispam dependem do IP do visitante, e o cabeçalho `X-Forwarded-For`
pode ser forjado. O que o proxy do Railway faz com ele não é documentado de forma confiável, então
**medimos** antes de abrir o sistema (ADR 0013). Sem isso, no modo `CONEXAO`, todo mundo apareceria
com o IP do proxy e um bloqueio de IP travaria o sistema inteiro.

1. Configure `IP_CLIENTE_DIAGNOSTICO=true` e faça o deploy.
2. Do seu computador, mande o formulário público com um IP falso no cabeçalho (ele não exige
   login nem CSRF):
   ```bash
   curl -s -X POST https://SEU-DOMINIO/api/public/solicitacoes -H "Content-Type: application/json" \
        -H "X-Forwarded-For: 6.6.6.6" -d '{"tipo":"OUTRO","animalSlug":"medicao-inexistente","nome":"Medicao","email":"m@exemplo.invalid","consentimento":true,"site":""}'
   ```
   (o animal inexistente faz o sistema responder 422 sem gravar nada, mas o envio conta no limite)
3. Descubra o seu IP real (ex.: https://ifconfig.me) e procure no log do Railway a linha
   `Diagnóstico de IP em /api/public/solicitacoes: conexão=... X-Forwarded-For=... X-Real-IP=...`.
4. Escolha o modo:

   | O que apareceu | `IP_CLIENTE_MODO` |
   |---|---|
   | `X-Forwarded-For=6.6.6.6, SEU_IP` (o falso ficou, o proxy acrescentou o real no fim) | `X_FORWARDED_FOR_ULTIMO` |
   | `X-Forwarded-For=SEU_IP` (o falso sumiu) | `X_FORWARDED_FOR_ULTIMO` (também funciona) |
   | `X-Forwarded-For=SEU_IP, outro-ip` (um CDN no meio) | anote e decida com cuidado: `X_REAL_IP` se ele mostrar `SEU_IP` |

5. Configure o modo, volte `IP_CLIENTE_DIAGNOSTICO=false`, faça o deploy e repita o passo 2:
   o diagnóstico desligado não registra nada; confirme pelo comportamento: 6 envios do formulário
   (o mesmo comando acima), trocando o `X-Forwarded-For` a cada um (6.6.6.1, 6.6.6.2...). Os 5
   primeiros dão 422 e o 6º precisa dar **429**. Se o 6º der 422, o IP falso está sendo aceito:
   o modo está errado.
6. Registre aqui a data, o resultado e o modo escolhido. Refaça a medição se o Railway mudar a
   rede (ex.: CDN na frente).

## Bloqueios de login (ADR 0013)

**Quem está bloqueado e desde quando**
```sql
select ip, coalesce(email, '(IP inteiro)') as alvo, motivo, bloqueado_em
  from bloqueio_login
 order by bloqueado_em desc;
```

Contas que recusam login por **10 erros em 15 minutos** (rede de segurança temporária) não aparecem
aqui: ficam livres sozinhas quando a janela passa, ou na hora com o "liberar um e-mail" abaixo.

**Liberar um e-mail em todas as redes** (é o que o botão "Desbloquear" da tela faz; use para a
conta do administrador, que a tela não libera)
```sql
begin;
delete from bloqueio_login  where email = 'fulano@exemplo.com';
delete from tentativa_login where email = 'fulano@exemplo.com';
commit;
```

**Liberar um IP inteiro** (bloqueado por errar senha em vários e-mails)
```sql
begin;
delete from bloqueio_login  where ip = '200.100.50.25' and email is null;
delete from tentativa_login where ip = '200.100.50.25';
commit;
```

**Senhas erradas recentes de um IP** (para entender o que aconteceu antes de liberar)
```sql
select email, em from tentativa_login where ip = '200.100.50.25' order by em desc;
```

## Fotos no Cloudflare R2 (ADR 0015)

Feito uma vez, na conta Cloudflare **da ONG** (o responsável técnico entra como membro, sem acesso
à cobrança):

1. **R2 → ativar.** Passa por um "checkout" mesmo no plano gratuito (10 GB, sem custo de saída).
2. **Criar o bucket** `abrigo-fotos`, localização automática. Deixe o acesso público **desligado**
   e não ative o endereço `r2.dev` (é de teste, com limite de uso).
3. **Criar um token de API do R2** (R2 → Gerenciar tokens de API): permissão **Leitura e escrita
   de objetos**, aplicada **só ao bucket `abrigo-fotos`**. Anote o *Access Key ID* e o *Secret
   Access Key* (o segredo aparece uma vez só; guarde no gerenciador de senhas da ONG).
4. **Variáveis no Railway** (serviço da aplicação):

   | Variável | Valor |
   |---|---|
   | `ARMAZENAMENTO_TIPO` | `s3` |
   | `S3_ENDPOINT` | `https://<ID-da-conta>.r2.cloudflarestorage.com` (aparece na página do bucket) |
   | `S3_REGIAO` | `auto` |
   | `S3_BUCKET` | `abrigo-fotos` |
   | `S3_CHAVE_ACESSO` / `S3_CHAVE_SECRETA` | as do token do passo 3 |
   | `S3_CRIAR_BUCKET` | não definir (só desenvolvimento) |
   | `ARMAZENAMENTO_URL_PUBLICA` | vazio no início (fotos passam pelo backend) |

5. **Conferir no log do deploy:** `Fotos no bucket "abrigo-fotos" (entregues pelo backend em /arquivos)`.
   Se o bucket ou a chave estiverem errados, a aplicação não sobe e o log diz o que conferir.
6. **Depois que o domínio da ONG estiver com o DNS na Cloudflare:** bucket → Configurações →
   Domínios personalizados → conectar `fotos.<domínio>`. Teste abrindo uma foto por esse endereço
   e só então defina `ARMAZENAMENTO_URL_PUBLICA=https://fotos.<domínio>`. Para voltar atrás, basta
   apagar a variável: as fotos voltam a passar pelo backend, sem perder nada.

**Trocar a chave** (se vazar ou alguém sair da equipe): crie um token novo, troque as duas
variáveis no Railway, confira o deploy e só então apague o token antigo no painel.

## Senha do administrador

Se o administrador esqueceu a senha, ninguém pela tela consegue redefinir (ADR 0012). O próprio
Postgres gera o hash BCrypt com a extensão `pgcrypto`:

```sql
create extension if not exists pgcrypto;

begin;
update usuario
   set senha_hash = '{bcrypt}' || crypt('UmaSenhaProvisoria2026', gen_salt('bf', 10))
 where email = 'abrigoanimal.sistema@gmail.com';
commit;
```

Depois: entrar com a senha provisória e trocar em **Equipe → Trocar minha senha**. Se a conta
também estiver bloqueada, libere o e-mail (seção anterior).
