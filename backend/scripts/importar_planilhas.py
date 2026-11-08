#!/usr/bin/env python3
"""
Carga inicial: planilhas "CONTROLE DE VACINA" da ONG -> SQL (animal + vacina_animal).

Vacinas na opção B: grava QUAIS vacinas o animal tomou e a data da última dose.
As colunas "REVACINAR" das planilhas são ignoradas (o sistema não faz gestão de vacinas).

Uso (com o banco já criado pelo Flyway, ou seja, o backend já rodou uma vez):

    # na pasta backend/: gera o SQL
    python scripts/importar_planilhas.py "../CONTROLE DE VACINA ALA A.xlsx" ... [--vitrine]

    # na raiz do repositório: copia para dentro do container e o psql lê o arquivo direto
    docker compose cp backend/dados/carga/carga.sql postgres:/tmp/carga.sql
    docker compose exec postgres psql -U abrigo -d abrigo -v ON_ERROR_STOP=1 -f /tmp/carga.sql

    NÃO use "Get-Content carga.sql | docker ..." no PowerShell: o pipe converte o texto para
    ASCII e todo acento vira "?" no banco ("Alemão" -> "Alem?o").

Gera em dados/carga/ (pasta fora do git — dados da ONG não vão para o repositório):
  - carga.sql        idempotente: rodar de novo não duplica (ids fixos + "on conflict do nothing")
  - pendencias.md    o que a ONG precisa conferir (datas digitadas errado, chip faltando...)

--vitrine  publica os animais na vitrine. Sem a opção, entram ocultos: animal sem foto nem
           descrição não convence ninguém; a equipe publica um a um depois de completar.

Requer: pip install openpyxl
"""
import argparse
import datetime as dt
import re
import sys
import unicodedata
import uuid
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("Instale a dependência: pip install openpyxl")

# Namespace fixo: o mesmo animal gera sempre o mesmo id (carga idempotente).
NAMESPACE = uuid.UUID("6f1c2b0e-8d3a-4c55-9f1e-0a6b7c8d9e10")
AUTOR = "importacao-planilhas"

# Nome do arquivo -> ala. A planilha não tem coluna de ala: cada arquivo É uma ala.
ALAS = [
    ("ASILO OSNILDA", "Asilo Osnilda"),
    ("ASILO ABRIGO", "Asilo Abrigo"),
    ("ALA A", "Ala A"),
    ("ALA B", "Ala B"),
    ("ALA C", "Ala C"),
]
# Asilos abrigam os mais velhos (informação da ONG). A equipe ajusta caso a caso depois.
ALAS_DE_IDOSOS = {"Asilo Osnilda", "Asilo Abrigo"}
# As planilhas não têm a coluna, mas a ONG confirmou (nov/2026) que TODOS os animais são castrados.
CASTRADO = True

CORES = {
    "PTO": "preto", "PRET": "preto", "PRETO": "preto", "PRETA": "preto",
    "MARR": "marrom", "MAR": "marrom", "MARROM": "marrom",
    "BCO": "branco", "BRAN": "branco", "BRANCO": "branco", "BRANCA": "branco",
    "CAR": "caramelo", "CARAM": "caramelo", "CARRM": "caramelo", "CARAMELO": "caramelo",
    "BEG": "bege", "BEGE": "bege", "CREM": "creme", "CREME": "creme",
}

COLUNAS = ["NOME", "SEXO", "COR", "CANIL", "CHIP", "VERMIFUGO", "V8/POLY", "REVACINAR", "RAIVA", "REVACINAR"]


class Relatorio:
    def __init__(self):
        self.itens = []

    def add(self, origem, animal, problema):
        self.itens.append((origem, animal or "(sem nome)", problema))


def ala_do_arquivo(caminho):
    nome = Path(caminho).stem.upper()
    for chave, ala in ALAS:
        if chave in nome:
            return ala
    sys.exit(f"Não sei a ala do arquivo: {caminho}")


def titulo(texto):
    return " ".join(p.capitalize() for p in texto.split())


def limpar(valor):
    if valor is None:
        return None
    texto = re.sub(r"\s+", " ", str(valor)).strip()
    return texto or None


def normalizar_cor(valor):
    texto = limpar(valor)
    if not texto:
        return None
    partes = [p.strip(" .") for p in re.split(r"[/]", texto.upper()) if p.strip(" .")]
    traduzidas = []
    for parte in partes:
        palavras = [CORES.get(w.strip("."), w.strip(".").lower()) for w in parte.split()]
        traduzidas.append(" ".join(palavras))
    cor = " e ".join(dict.fromkeys(traduzidas))  # sem repetir
    return cor[:1].upper() + cor[1:]


def normalizar_canil(valor):
    texto = limpar(valor)
    if not texto:
        return None
    texto = texto.upper()
    texto = re.sub(r"^SOLTO\s*([ABC])$", r"SOLTO \1", texto)  # "SOLTOA" -> "SOLTO A"
    if re.fullmatch(r"\d+\s*[A-Z]", texto):  # "14A", "21 C"
        return texto.replace(" ", "")
    return titulo(texto)


def normalizar_chips(valor, origem, nome, rel):
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        rel.add(origem, nome, "sem chip")
        return None, None
    if isinstance(valor, float):
        valor = str(int(valor))
    numeros = re.findall(r"\d+", str(valor).replace(" ", ""))
    for n in numeros:
        if len(n) != 15:
            rel.add(origem, nome, f"chip {n} tem {len(n)} dígitos (o padrão é 15): conferir")
    if len(numeros) > 2:
        rel.add(origem, nome, f"mais de dois chips ({valor}): só os dois primeiros entraram")
    return (numeros[0] if numeros else None), (numeros[1] if len(numeros) > 1 else None)


def normalizar_data(valor, origem, nome, coluna, rel):
    if valor is None:
        return None
    if isinstance(valor, dt.datetime):
        return valor.date()
    if isinstance(valor, dt.date):
        return valor
    texto = str(valor).strip().upper().replace("O", "0")  # "22/O6/2026": letra O no lugar do zero
    try:
        data = dt.datetime.strptime(texto, "%d/%m/%Y").date()
        rel.add(origem, nome, f"{coluna}: data digitada como texto ({valor!r}), lida como {data:%d/%m/%Y}")
        return data
    except ValueError:
        rel.add(origem, nome, f"{coluna}: data ilegível ({valor!r}), ignorada")
        return None


def slug(nome, ident):
    base = unicodedata.normalize("NFD", nome)
    base = "".join(c for c in base if unicodedata.category(c) != "Mn").lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-") or "animal"
    return f"{base[:60].rstrip('-')}-{str(ident)[:6]}"


def sql(valor):
    if valor is None:
        return "null"
    if isinstance(valor, bool):
        return "true" if valor else "false"
    if isinstance(valor, (dt.date, uuid.UUID)):
        return f"'{valor}'"
    return "'" + str(valor).replace("'", "''") + "'"


def ler(caminho, rel):
    ala = ala_do_arquivo(caminho)
    ws = openpyxl.load_workbook(caminho, data_only=True).worksheets[0]
    cabecalho = None
    animais = []
    for numero, linha in enumerate(ws.iter_rows(values_only=True), start=1):
        valores = list(linha[:10]) + [None] * (10 - len(linha[:10]))
        if cabecalho is None:
            if limpar(valores[0]) == "NOME":
                cabecalho = numero
                encontrados = [limpar(v) for v in valores]
                if encontrados != COLUNAS:
                    sys.exit(f"{caminho}: colunas diferentes do esperado: {encontrados}")
            continue
        if not any(v is not None and str(v).strip() for v in valores):
            continue
        origem = f"{Path(caminho).name}, linha {numero}"
        nome = limpar(valores[0])
        if not nome:
            rel.add(origem, None, f"linha sem animal (canil {limpar(valores[3])}): canil vazio?")
            continue
        nome = titulo(nome)
        chip, chip2 = normalizar_chips(valores[4], origem, nome, rel)
        sexo = {"M": "MACHO", "F": "FEMEA"}.get((limpar(valores[1]) or "").upper(), "INDEFINIDO")
        if sexo == "INDEFINIDO":
            rel.add(origem, nome, f"sexo não reconhecido ({valores[1]!r})")
        ident = uuid.uuid5(NAMESPACE, chip or f"{Path(caminho).name}#{numero}")
        vacinas = []
        # coluna da planilha -> TipoVacina do sistema
        for coluna, rotulo, tipo in [(6, "V8", "V8_V10"), (8, "RAIVA", "ANTIRRABICA"), (5, "VERMIFUGO", "VERMIFUGO")]:
            data = normalizar_data(valores[coluna], origem, nome, rotulo, rel)
            if data is None:
                if tipo != "VERMIFUGO":
                    rel.add(origem, nome, f"sem data de {rotulo}")
                continue
            if data > dt.date.today():
                rel.add(origem, nome, f"{rotulo} com data futura ({data:%d/%m/%Y}): entrou sem a data")
                data = None
            vacinas.append((tipo, data))
        animais.append(dict(id=ident, nome=nome, sexo=sexo, cor=normalizar_cor(valores[2]),
                            canil=normalizar_canil(valores[3]), chip=chip, chip2=chip2, ala=ala,
                            idoso=ala in ALAS_DE_IDOSOS, vacinas=vacinas, origem=origem))
    if cabecalho is None:
        sys.exit(f"{caminho}: não achei a linha de cabeçalho (NOME, SEXO, COR...)")
    return animais


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("planilhas", nargs="+")
    p.add_argument("--vitrine", action="store_true", help="publicar os animais na vitrine")
    p.add_argument("--saida", default="dados/carga")
    args = p.parse_args()

    rel = Relatorio()
    animais = [a for caminho in args.planilhas for a in ler(caminho, rel)]

    vistos = {}
    for a in animais:
        for c in filter(None, [a["chip"], a["chip2"]]):
            if c in vistos:
                rel.add(a["origem"], a["nome"], f"chip {c} repetido (também em {vistos[c]}): animal NÃO importado")
                a["descartar"] = True
            vistos.setdefault(c, f'{a["nome"]} — {a["origem"]}')
    animais = [a for a in animais if not a.get("descartar")]

    agora = dt.datetime.now(dt.timezone.utc).isoformat()
    saida = Path(args.saida)
    saida.mkdir(parents=True, exist_ok=True)
    linhas = [
        f"-- Gerado por scripts/importar_planilhas.py em {agora}. NÃO versionar (dados da ONG).",
        "begin;",
    ]
    for a in animais:
        linhas.append(
            "insert into animal (id, versao, organizacao_id, nome, slug, especie, sexo, cor, castrado, chip, chip_adicional, "
            "ala, canil, idoso, situacao, visivel_na_vitrine, criado_em, atualizado_em, criado_por, atualizado_por) "
            f"values ({sql(a['id'])}, 0, 1, {sql(a['nome'])}, {sql(slug(a['nome'], a['id']))}, 'CAO', "
            f"{sql(a['sexo'])}, {sql(a['cor'])}, {sql(CASTRADO)}, {sql(a['chip'])}, {sql(a['chip2'])}, {sql(a['ala'])}, "
            f"{sql(a['canil'])}, {sql(a['idoso'])}, 'DISPONIVEL', {sql(args.vitrine)}, now(), now(), "
            f"'{AUTOR}', '{AUTOR}') on conflict (id) do nothing;")
        for tipo, data in a["vacinas"]:
            linhas.append(
                "insert into vacina_animal (animal_id, tipo, ultima_dose) "
                f"values ({sql(a['id'])}, '{tipo}', {sql(data)}) on conflict (animal_id, tipo) do nothing;")
    linhas.append("commit;")
    (saida / "carga.sql").write_text("\n".join(linhas) + "\n", encoding="utf-8")

    total_vacinas = sum(len(a["vacinas"]) for a in animais)
    md = [f"# Pendências da importação ({dt.date.today():%d/%m/%Y})", "",
          f"- Animais importados: **{len(animais)}**",
          f"- Vacinas registradas (última dose): **{total_vacinas}**",
          f"- Vitrine: **{'publicados' if args.vitrine else 'ocultos (publicar depois de pôr foto e descrição)'}**",
          f"- Marcados como idosos (estão nos asilos): **{sum(a['idoso'] for a in animais)}** — a equipe confere",
          "- Castrados: **todos** (confirmado pela ONG; as planilhas não têm a coluna)",
          "", "## Para a ONG conferir", "", "| Onde | Animal | O que conferir |", "|---|---|---|"]
    md += [f"| {o} | {n} | {p} |" for o, n, p in rel.itens] or ["| — | — | nada |"]
    (saida / "pendencias.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    print(f"{len(animais)} animais, {total_vacinas} vacinas registradas, {len(rel.itens)} pendências")
    print(f"-> {saida / 'carga.sql'}\n-> {saida / 'pendencias.md'}")


if __name__ == "__main__":
    main()
