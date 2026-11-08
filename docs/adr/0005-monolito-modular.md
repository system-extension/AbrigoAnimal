# 0005 · Monólito modular com Spring Modulith

**Status:** aceita (2026-09-26)

## Contexto
Equipe pequena, 2 a 10 usuários internos, orçamento de ONG, entrega em novembro/2026.
O roadmap tem várias fases (apadrinhamento, adoção, estoque, saúde) que precisam crescer sem se misturar.

## Decisão
Um único Spring Boot (um deploy), organizado em módulos por **pacote de primeiro nível**.
Cada módulo expõe uma API pública (classes do pacote raiz) e esconde o resto em `internal/`.
Módulos conversam por **chamada direta** (quando precisam da resposta) ou por **evento**
(quando só avisam algo). Entidades de módulos diferentes se referenciam **só por id**.
`ModularidadeTest` (Spring Modulith `verify()`) quebra o build se as fronteiras forem violadas.

## Consequências
- Um serviço para hospedar e pagar
- Cada fase nova = um módulo novo
- Se um dia for preciso, um módulo pode virar serviço separado: as fronteiras já existem
- Exige disciplina: nada de `@ManyToOne` entre módulos (as chaves estrangeiras ficam só no banco)
