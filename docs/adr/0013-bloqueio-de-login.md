# 0013 · Bloqueio de login contra força bruta, sem dar pistas

**Status:** aceita (2026-11-08)

## Contexto
O login aceitava tentativas sem limite: um robô podia testar milhares de senhas numa conta, a do
administrador inclusive. Três cuidados guiaram a solução:
- **Não dar pistas** a quem ataca: nem se o e-mail existe, nem se foi bloqueado, nem se acertou.
- **Não deixar ninguém trancar a conta dos outros**: o e-mail do administrador não é segredo; um
  bloqueio da conta inteira permitiria parar o sistema da ONG com 5 cliques, de qualquer lugar.
- **Redes compartilhadas**: no Wi-Fi da ONG e no 4G (CGNAT) muita gente sai pelo mesmo IP;
  bloquear um IP inteiro por causa de quem esqueceu a própria senha travaria todo mundo.

## Decisão
- **5 senhas erradas seguidas** no mesmo e-mail, vindas do mesmo IP → aquele e-mail fica
  bloqueado **naquele IP**, sem prazo. A pessoa, em outra rede, continua entrando.
- Um IP que erra senha em **3 e-mails diferentes** dentro de 1 hora (existentes ou não) → o
  **IP inteiro** fica bloqueado, sem prazo. É a assinatura de robô.
- Bloqueado recebe **exatamente** a resposta de uma senha errada (401, sem corpo), até com a senha
  certa. **Mesmo tempo também**: recusar um bloqueado era mais rápido que conferir uma senha
  errada (~66 ms contra ~78 ms, medido na homologação), e a diferença denunciaria o bloqueio. Toda
  recusa de login só responde depois de um piso fixo de 400 ms, o que ainda deixa cada chute de
  robô mais lento. A tela de login mostra sempre "Não consegue entrar? Fale com o
  administrador da equipe".
- Login certo zera os erros daquele e-mail naquele IP (conta erros *seguidos*).
- **Rede de segurança que não depende de IP**: 10 senhas erradas na mesma conta em 15 minutos,
  de qualquer lugar, fazem a conta recusar tudo (a mesma resposta 401) até a janela passar.
  Temporário de propósito, para ninguém trancar a conta do administrador de fora.
- **De onde vem o IP**: o cabeçalho `X-Forwarded-For` pode ser forjado por qualquer visitante (o
  teste de homologação provou: trocando só o cabeçalho, o limite do formulário público foi burlado).
  O `forward-headers-strategy: framework` foi desligado e um único componente, `IpDoCliente`, decide
  o IP conforme `IP_CLIENTE_MODO` (conexão, último ou primeiro valor do `X-Forwarded-For`,
  `X-Real-IP`). Como a documentação do Railway é contraditória sobre o que o proxy dele faz com o
  cabeçalho, o modo de produção é escolhido **medindo** no deploy ([guia de produção](../producao.md)).
- Tudo no banco (`tentativa_login`, `bloqueio_login`, migração V8): sobrevive a reinícios.
- **Quem desbloqueia:** o administrador, na tela Equipe, vê o selo "Bloqueado" na conta do colega
  e libera com um toque (sem IP nem detalhe técnico na tela). A conta do administrador e os IPs
  inteiros só o responsável técnico libera, direto no banco ([guia de produção](../producao.md)).
- Cada bloqueio vira um aviso no log, com o IP e o e-mail mascarado (`ab***@gmail.com`, LGPD).
- Números configuráveis em `abrigo.login.*` (`application.yml`).
- O cookie do CSRF passou a seguir `COOKIE_SECURE` (antes dependia do `forward-headers-strategy`).

## Consequências
- Ataque distribuído (milhares de IPs reais, ou IP forjado se o modo estiver errado) fica limitado
  pela rede de segurança da conta: no máximo ~40 chutes por hora por conta. Em troca, quem ataca
  consegue deixar uma conta recusando login por 15 minutos de cada vez.
- Atrás do proxy, o modo `CONEXAO` enxergaria todo mundo com o IP do proxy: o bloqueio de IP
  inteiro travaria o sistema para todos. Por isso medir e configurar `IP_CLIENTE_MODO` é passo
  obrigatório do deploy.
- Quem esquece a senha e insiste 5 vezes fica bloqueado naquela rede e não é avisado: precisa
  procurar o administrador (que libera e, se for o caso, define uma senha provisória).
- Se um dia houver várias instâncias do backend, nada muda: o estado já está no banco.
