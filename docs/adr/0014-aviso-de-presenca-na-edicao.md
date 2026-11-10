# 0014 · Aviso de presença na edição, sem trava

**Status:** aceita (2026-11-09)

## Contexto
Duas pessoas podiam abrir o mesmo cadastro de animal. O bloqueio otimista (versão + 409, RN-12)
já impedia que uma alteração apagasse a outra, mas o segundo a salvar descobria tarde, e a tela
recarregava **descartando o que ele tinha digitado**.

O Ítalo trouxe o modelo do SAP: quem abre a remessa primeiro a "tranca", e o segundo vê
"em processamento por usuário tal". Lá funciona porque o servidor controla a sessão do SAP GUI e
sabe quando ela acaba (e existe a SM12 para soltar travas presas). Num site aberto pelo celular o
servidor não fica sabendo quando a pessoa largou a tela (tela apagou no bolso, bateria acabou):
uma trava rígida deixaria o animal preso para todo mundo.

## Decisão
- **Aviso, não trava.** Enquanto o formulário de edição está aberto, a tela manda um sinal a cada
  30 s (`POST /api/edicoes/animal/{id}`); sem sinal por 2 minutos a presença some. Sair da tela,
  salvar, cancelar ou fechar a página manda `DELETE` (com `keepalive`).
- Quem abre um cadastro já aberto vê **"Maria está editando este cadastro desde 10:42"** e escolhe
  **Só visualizar** (campos travados) ou **Editar mesmo assim**.
- O **409 não descarta mais nada**: a tela mostra quem salvou, a que horas e quais campos mudaram;
  o que a pessoa digitou fica na tela, e ela escolhe salvar por cima, descartar o seu ou revisar.
- Presença em memória no backend (`EdicoesEmAndamento`, módulo identidade): se o servidor
  reiniciar, os avisos voltam no próximo sinal. Rota genérica por tipo de cadastro; hoje só o
  animal usa.

## Consequências
- Ninguém fica preso por trava esquecida; em troca, o aviso é só um aviso: duas pessoas ainda
  podem editar juntas se escolherem "Editar mesmo assim", e aí o 409 (agora sem perda) decide.
- Mais tráfego: um sinal a cada 30 s por formulário aberto (desprezível para a equipe da ONG).
- Com várias instâncias do backend, a presença teria que ir para o banco.
