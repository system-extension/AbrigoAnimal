# Regras de negócio

O que o sistema **faz hoje**, regra por regra, e onde cada uma está garantida no código.
Os requisitos (o que a ONG pediu, com IDs RF-xx) ficam no Notion, em "Requisitos do sistema";
este documento descreve como eles foram implementados. Mudou uma regra no código → atualize a
linha aqui no mesmo PR.

**Como ler:** *Onde* aponta a classe que garante a regra. Regras em entidades (`domain/`) são
testadas sem Spring e sem banco; as de unicidade também têm proteção no banco. Violação de regra
responde **422** com a mensagem mostrada ao usuário; dado em formato inválido responde **400**.

## Animais

| ID | Regra | Onde | Origem |
|---|---|---|---|
| RN-01 | **Nome e espécie** (cão ou gato) são obrigatórios. Sem sexo informado, fica "indefinido" | `Animal` | RF-01 |
| RN-02 | O endereço público (`slug`, ex.: `thor-3f2a1b`) é gerado no cadastro e **nunca muda**, nem quando o nome é editado: links compartilhados continuam valendo. O sufixo do id permite nomes repetidos (há vários "Marley") | `Slugs`, `Animal` | RF-22 |
| RN-03 | Até **dois chips** por animal (o segundo é aplicado quando o primeiro para de ler). Nenhum chip pode se repetir no cadastro inteiro, em nenhum dos dois campos. Espaços digitados são removidos; o segundo chip não pode ser igual ao primeiro; segundo chip sem o primeiro vira o primeiro | `Animal`, `GestaoAnimais` + índices únicos (V2) | RF-01, planilhas |
| RN-04 | **Castrado** aceita sim, não ou **não informado**. Não informado não aparece na vitrine (dizer "não" sem saber seria afirmar algo falso) | `Animal` | RF-01 |
| RN-05 | **Idoso** é marcado pela equipe (não há data de nascimento confiável para calcular). O formulário sugere marcar a partir de 8 anos (cão) ou 10 (gato) | `Animal`, `FormularioAnimal.jsx` | RF-05 |
| RN-06 | **Temperamento**: até 8 características, sem repetir, cada uma com até 30 letras | `Animal` | RF-03 |
| RN-07 | **Medicação contínua** = campo "medicações" preenchido (não é um campo separado) | `Animal` | RF-05 |
| RN-08 | **Vacinas** ([ADR 0010](adr/0010-vacinas-no-cadastro.md)): registra **quais** o animal já tomou (V8/V10, V3/V4, antirrábica, gripe canina, vermífugo) e, se souber, a data da última dose. Uma por tipo; data não pode ser futura; ao salvar, a lista enviada substitui a anterior. **Não há** histórico, próxima dose nem alerta | `Animal`, `AnimalRequest` | RF-08 |
| RN-09 | **Situação**: disponível, em tratamento, adotado ou óbito. Todo animal novo nasce **disponível e visível na vitrine**. Ter padrinho **não** é situação: o animal apadrinhado continua disponível para adoção | `Animal` | RF-04 |
| RN-10 | **Óbito** só entra pelo registro de óbito (não pela troca de situação), com data obrigatória e não futura. É **estado final**: a situação não muda mais, o animal sai da vitrine e não pode voltar a ela, e não aceita novos apadrinhamentos | `Animal` | RF-04 |
| RN-11 | **Fotos**: até 10 por animal; só JPG, PNG ou WEBP (conferido pelo conteúdo do arquivo, não pelo nome); até 3 MB (o celular já envia comprimido). A primeira foto é a principal; remover a principal promove a seguinte | `Animal`, `GestaoAnimais`, `TipoImagem` | RF-02 |
| RN-12 | Duas pessoas editando o mesmo animal: quem salvar por último recebe aviso (**409**) em vez de apagar a alteração da outra | `GestaoAnimais` (campo `versao`) | RNF-09 |

## Vitrine pública

| ID | Regra | Onde | Origem |
|---|---|---|---|
| RN-20 | Aparece na vitrine o animal **visível e sem óbito**. Idosos aparecem primeiro | `EspecificacoesAnimal`, `VitrineController` | RF-20, RF-23 |
| RN-21 | "Disponível para adoção" só quando a situação é **disponível**; nos demais casos o animal aparece só para apadrinhamento | `AnimalPublicoResponse` | RF-25 |
| RN-22 | A vitrine **nunca** mostra: chip, ala, canil (o Asilo Osnilda é a casa da fundadora), datas das vacinas, ids internos, quem cadastrou/alterou, nem qualquer dado de pessoas | `AnimalVitrine` + `AnimalPublicoResponse` (barreira dupla) + `ApiPublicaSemDadosSensiveisTest` | RNF-04 |
| RN-23 | O link de um animal compartilhado no WhatsApp/Instagram mostra nome, descrição e foto principal; animal fora da vitrine responde "não encontrado" | `OpenGraphController` | RF-22 |

## Pessoas (padrinhos)

| ID | Regra | Onde | Origem |
|---|---|---|---|
| RN-30 | Nome obrigatório e **pelo menos um contato** (telefone ou e-mail). Telefone com DDD (10 a 13 dígitos) | `Pessoa` | RF-10 |
| RN-31 | **CPF opcional**; se informado, precisa ser válido (dígitos verificadores) e não pode repetir | `Cpf`, `GestaoPessoas` + índice único (V3) | RF-10 |
| RN-32 | O sistema registra **quando** a pessoa consentiu com o uso dos dados (LGPD) | `Pessoa` (`consentimento_em`) | RNF-04 |
| RN-33 | Uma mesma pessoa pode ser padrinho hoje e adotante depois (cadastro único) | módulo `pessoas` | RF-30 |

## Apadrinhamento

| ID | Regra | Onde | Origem |
|---|---|---|---|
| RN-40 | Pessoa ↔ animal é **N:N sem limite**: um animal pode ter vários padrinhos e um padrinho vários afilhados | `Apadrinhamento` | RF-11 |
| RN-41 | Uma pessoa não pode ter **dois apadrinhamentos ativos** do mesmo animal | `GestaoApadrinhamentos` + índice parcial (V4) | RF-11 |
| RN-42 | Não é possível apadrinhar animal com **óbito** registrado | `GestaoApadrinhamentos` | RF-11 |
| RN-43 | Data de início obrigatória e não futura. Tipo de apoio: **afetivo** (padrão), **financeiro** ou **ambos**; contribuição livre, sem valor, cobrança ou vencimento ([ADR 0002](adr/0002-financeiro-fora-do-escopo.md)) | `Apadrinhamento` | RF-12 |
| RN-44 | Encerrar: só um apadrinhamento ativo, com data entre o início e hoje. O vínculo encerrado **continua no histórico** | `Apadrinhamento` | RF-15 |

## Solicitações (formulário "quero apadrinhar / quero adotar")

| ID | Regra | Onde | Origem |
|---|---|---|---|
| RN-50 | Sem criar conta. Obrigatórios: nome, um contato (telefone com DDD ou e-mail) e **consentimento** LGPD | `Solicitacao` | RF-21, RF-25 |
| RN-51 | Se vier de um animal, ele precisa estar **na vitrine** | `GestaoSolicitacoes` | RF-21 |
| RN-52 | **Antispam**: campo isca escondido (se preenchido, finge sucesso e não grava) e limite de envios por IP por hora (padrão 5, configurável) | `GestaoSolicitacoes`, `LimitadorDeEnvios` | RF-26 |
| RN-53 | Toda solicitação nasce **nova**; a equipe muda para em contato, concluída ou descartada, com observação interna opcional | `Solicitacao` | RF-24 |
| RN-54 | Ao chegar uma solicitação, o sistema publica um evento. Hoje o aviso só vai para o log (canal de notificação a definir) | `AvisoNovaSolicitacao` | RF-27 |

## Usuários da equipe

| ID | Regra | Onde | Origem |
|---|---|---|---|
| RN-60 | Login individual por e-mail e senha; e-mail único (sem diferenciar maiúsculas); senha com **no mínimo 8 caracteres** | `GestaoUsuarios`, `Usuario` | RNF-03 |
| RN-61 | Primeiro acesso: se não houver nenhum usuário, o sistema cria o administrador a partir de `ADMIN_EMAIL`/`ADMIN_SENHA` | `AdminInicial` | — |
| RN-62 | Usuário desativado não consegue mais entrar (uma sessão já aberta vale até expirar); ninguém pode desativar o próprio usuário. Não há perfis diferentes: toda a equipe tem o mesmo acesso | `GestaoUsuarios` | RNF-03 |
| RN-63 | A sessão expira após 8 horas | `application.yml` | — |

## Pontos em aberto (decidir com a ONG)

| Ponto | Comportamento atual |
|---|---|
| Animal com óbito que tinha padrinhos | os apadrinhamentos ativos **não** são encerrados automaticamente; a equipe encerra um a um |
| Cadastro de pessoa sem consentimento marcado | é aceito (só não registra a data). Avaliar se deve ser obrigatório |
| CPF e endereço do padrinho | opcionais; pela LGPD, se não forem usados, não deveriam ser coletados |
| Canal de aviso de nova solicitação | só no log |
| Gatos e gatil | as planilhas só têm cães; o sistema aceita gatos |
| Intervalo do vermífugo | não é controlado ([ADR 0010](adr/0010-vacinas-no-cadastro.md)) |
