# 0010 · Vacinas registradas no cadastro do animal, sem gestão de vacinas

**Status:** aceita (2026-11-07)

## Contexto
Gestão de vacinas está fora do escopo da entrega. Mas a ONG controla os animais em planilhas
"CONTROLE DE VACINA" (uma por ala) cujas colunas são, na maior parte, o próprio cadastro
(nome, sexo, cor, canil, chip) mais as datas de V8, antirrábica e vermífugo. Sem nenhum registro
de vacina, a equipe continuaria mantendo a planilha em paralelo ao sistema (retrabalho e duas
versões da verdade).

Chegou a ser implementado um módulo de cuidados (histórico por aplicação, registro em lote,
pendências por ala). Ele foi descartado por ser gestão de vacinas.

## Decisão
O cadastro do animal registra **quais vacinas ele já tomou** e, opcionalmente, a data da última dose:
tabela `vacina_animal` (animal, tipo, `ultima_dose`), uma linha por animal + tipo, gravada junto com
o animal (sem rota própria). A vitrine mostra só quais vacinas, sem datas.

## Consequências
- Sem histórico, sem próxima dose, sem alertas de vencimento: se um dia virar escopo, é uma
  evolução a partir desta tabela (nova migration).
- A carga inicial (`backend/scripts/importar_planilhas.py`) importa a última dose de cada tipo;
  as colunas "REVACINAR" das planilhas são ignoradas.
