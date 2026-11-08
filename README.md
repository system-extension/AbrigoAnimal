# Abrigo Animal · Sistema de gestão

Sistema da ONG de abrigo animal de Joinville: cadastro dos animais, padrinhos,
vitrine pública e formulário de interesse (Fase 1).

**Arquitetura:** monólito modular (Java 25 + Spring Boot 4.1 + Spring Modulith 2.1), PostgreSQL,
um único deploy que serve a API e o frontend React.

## Documentação

| Documento | O que tem |
|---|---|
| [docs/arquitetura.md](docs/arquitetura.md) | Como o sistema é construído: módulos, dados, segurança, front, deploy |
| [docs/regras-de-negocio.md](docs/regras-de-negocio.md) | Cada regra implementada e onde ela está no código |
| [docs/adr/](docs/adr/README.md) | Decisões do projeto (escopo e técnicas), uma por arquivo |
| [docs/api.md](docs/api.md) | Contrato HTTP |
| [docs/producao.md](docs/producao.md) | Procedimentos em produção: acesso ao banco, desbloqueios, senha do administrador |
| [frontend/docs/](frontend/docs/GUIA_FRONTEND.md) | Guia do front e guia de design |

Entrevistas, requisitos combinados com a ONG, pendências e cronograma ficam no Notion da equipe.

## Módulos

| Módulo | Responsabilidade | Depende de |
|---|---|---|
| `plataforma` | Entidade base, erros, paginação, arquivos, fallback do React | — |
| `identidade` | Usuários, login por sessão, segurança | plataforma |
| `animais` | Cadastro, fotos, ficha de saúde, situação, vitrine | plataforma |
| `pessoas` | Cadastro único (padrinho e futuro adotante) | plataforma |
| `apadrinhamento` | Vínculo pessoa ↔ animal (N:N, apoio livre) | plataforma, animais, pessoas |
| `solicitacoes` | Formulário público + caixa de solicitações | plataforma, animais |
| `vitrine` | API pública e prévia para WhatsApp | plataforma, animais |

O teste `ModularidadeTest` garante essas fronteiras.

## Rodando localmente

Pré-requisitos: **JDK 25** e **Docker Desktop** aberto (Postgres e testes).
**Não precisa instalar Maven**: o projeto usa o Maven Wrapper (`mvnw` / `mvnw.cmd`), que baixa o Maven 3.9.11 sozinho na primeira execução.

```powershell
# PowerShell (Windows) — apontar para o JDK 25 (ajuste o caminho se for outro JDK)
$env:JAVA_HOME = "$env:USERPROFILE\.jdks\openjdk-25.0.2"

# 1. banco
docker compose up -d

# 2. testes (unidade + integração com Postgres real + arquitetura)
cd backend
.\mvnw.cmd verify

# 3. subir a API
$env:ADMIN_EMAIL="voce@exemplo.com"; $env:ADMIN_SENHA="trocar-esta-senha"; .\mvnw.cmd spring-boot:run
```

Linux/macOS/Git Bash: troque `.\mvnw.cmd` por `./mvnw`.

API em http://localhost:8080 · saúde: http://localhost:8080/actuator/health
A documentação dos módulos é gerada em `backend/target/spring-modulith-docs`.

## Configuração

Tudo por variável de ambiente, ver `.env.example`. **Nunca** versionar `.env`.

## Estrutura

```
backend/    Spring Boot (um pacote por módulo; subpacote internal/ = escondido dos outros módulos)
frontend/   React + Vite (site público + painel da equipe)
docs/       arquitetura, regras de negócio, API e decisões (ADRs)
```
