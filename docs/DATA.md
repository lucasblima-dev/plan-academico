# DATA.md — Especificação dos Dados

> Fonte da verdade para todos os dados do domínio.
> Nenhum dado de disciplina, código ou pré-requisito deve ser inventado — consulte aqui.
> **grade.json atualizado em 03/06/2026** — use sempre o arquivo em `data/grade.json`.

---

## 1. Histórico real de Lucas Bezerra de Lima

Matrícula: 20240021666 · Período Letivo Atual: 5 · semestre_atual: **1** (período ímpar)

### Disciplinas aprovadas (29 — extraídas do PDF SIGAA, emitido 26/05/2026)

| ID grade.json | Nome | Código SIGAA | Situação |
|---|---|---|---|
| ALGPROG | Algoritmos e Programação | CAN0077 | APR (equiv. NCC0211) |
| MATFUND | Matemática Fundamental | NCC0109 | APR |
| FILOS | Filosofia da Ciência | NCC0212 | APR |
| FISCOMP | Física para Computação | NCC0213 | APR |
| LOGMAT | Lógica Matemática Aplicada à Computação | NCC0214 | APR |
| TECS | Tecnologia, Ética e Sociedade | NCC0215 | APR |
| PRODTXT1 | Produção Textual | NCC0108 | CUMP |
| CALC1 | Cálculo | NCC0116 | CUMP |
| PROBEST | Probabilidade e Estatística | NCC0224 | CUMP |
| METCIENT | Metodologia para o Trabalho Científico | NCC0114 | APR |
| INGLES | Inglês Técnico | NCC0179 | APR |
| CIRCDIG | Circuitos Digitais | NCC0216 | APR |
| GEOANA | Geometria Analítica | NCC0217 | APR |
| TECPROG | Técnicas de Programação | NCC0218 | APR |
| TRANSDAT | Transmissão de Dados | NCC0229 | APR |
| UCE1 | UCE (1ª ocorrência) | UCE0002 | APR |
| ALGLIN | Álgebra Linear | NCC0219 | APR |
| ARQUCOMP | Arquitetura de Computadores | NCC0220 | APR |
| ENGSW | Engenharia de Software | NCC0221 | APR |
| ESTDADOS | Estrutura de Dados | NCC0222 | APR |
| PARAD | Paradigmas de Programação | NCC0223 | APR |
| REDES | Redes de Computadores | NCC0231 | APR |
| UCE2 | UCE (2ª ocorrência) | UCE0023 | APR |
| CALCNUM | Cálculo Numérico Computacional | NCC0015 | APR |
| APS | Análise e Projeto de Sistemas | NCC0225 | APR |
| BD | Banco de Dados | NCC0226 | APR |
| POO | Programação Orientada a Objetos | NCC0227 | APR |
| SO | Sistemas Operacionais | NCC0228 | APR |
| UCE3 | UCE (3ª ocorrência) | UCE0024 | APR |

### Disciplinas matriculadas — MATR (não aprovadas, não entram no histórico)

| Código SIGAA | Nome |
|---|---|
| NCC0230 | Inteligência Artificial |
| NCC0232 | Teoria da Computação |
| NCC0233 | Teoria dos Grafos |
| UCE0025 | UCE (4ª ocorrência) |
| CAN0062 | Prática de Programação para Robótica I (optativa) |
| CAN0065 | Programação para Dispositivos Móveis (optativa) |

### Disciplinas pendentes de Lucas — resultado esperado do grafo (22)

```
TEOCOMP, IA, UCE4, OPT1, OPT2,
TEOGRAF, UCE5, PRODCIENT, OPT3, SISDIST, COMPGRAF, OPT4, VISCOMP,
COMPALG, UCE6, PROGPAR, OPT5, TGAEMP, PTCC, COMP,
OPT6, TCC
```

> Nota: IA, TEOCOMP e TEOGRAF estão como MATR (matriculado atualmente).
> O sistema deve tratá-las como **pendentes** (não aprovadas) até que apareçam com situação APR.

Os testes do `test_graph_builder.py` devem verificar exatamente esses 22 nós.

---

## 2. Dicionário SIGAA_PARA_ID (completo)

```python
SIGAA_PARA_ID: dict[str, str] = {
    # ── 1º período ──────────────────────────────────────────
    "NCC0211": "ALGPROG",    # Algoritmos e Programação (código original)
    "CAN0077": "ALGPROG",    # Algoritmos e Programação (equivalência CAN)
    "NCC0109": "MATFUND",    # Matemática Fundamental
    "NCC0212": "FILOS",      # Filosofia da Ciência
    "NCC0214": "LOGMAT",     # Lógica Matemática Aplicada à Computação
    "NCC0215": "TECS",       # Tecnologia, Ética e Sociedade
    "NCC0108": "PRODTXT1",   # Produção Textual (CUMP)
    "NCC0213": "FISCOMP",    # Física para Computação
    # ── 2º período ──────────────────────────────────────────
    "NCC0179": "INGLES",     # Inglês Técnico
    "NCC0116": "CALC1",      # Cálculo (CUMP)
    "NCC0114": "METCIENT",   # Metodologia para o Trabalho Científico
    "NCC0218": "TECPROG",    # Técnicas de Programação
    "NCC0217": "GEOANA",     # Geometria Analítica
    "NCC0216": "CIRCDIG",    # Circuitos Digitais
    "UCE0002": "UCE1",       # UCE 1ª ocorrência
    # ── 3º período ──────────────────────────────────────────
    "NCC0222": "ESTDADOS",   # Estrutura de Dados
    "NCC0223": "PARAD",      # Paradigmas de Programação
    "NCC0220": "ARQUCOMP",   # Arquitetura de Computadores
    "NCC0221": "ENGSW",      # Engenharia de Software
    "NCC0224": "PROBEST",    # Probabilidade e Estatística (CUMP)
    "NCC0219": "ALGLIN",     # Álgebra Linear
    "UCE0023": "UCE2",       # UCE 2ª ocorrência
    # ── 4º período ──────────────────────────────────────────
    "NCC0015": "CALCNUM",    # Cálculo Numérico Computacional
    "NCC0225": "APS",        # Análise e Projeto de Sistemas
    "NCC0226": "BD",         # Banco de Dados
    "NCC0227": "POO",        # Programação Orientada a Objetos
    "NCC0228": "SO",         # Sistemas Operacionais
    "NCC0229": "TRANSDAT",   # Transmissão de Dados
    "UCE0024": "UCE3",       # UCE 3ª ocorrência
    # ── 5º período ──────────────────────────────────────────
    "NCC0230": "IA",         # Inteligência Artificial (atualmente MATR)
    "NCC0232": "TEOCOMP",    # Teoria da Computação (atualmente MATR)
    "NCC0231": "REDES",      # Redes de Computadores
    "UCE0025": "UCE4",       # UCE 4ª ocorrência (atualmente MATR)
    # ── 5º/6º período ────────────────────────────────────────
    "NCC0233": "TEOGRAF",    # Teoria dos Grafos (MATR — período 5, sem:2 na grade)
    "NCC0236": "PRODCIENT",  # Produção Científica
    "UCE0026": "UCE5",       # UCE 5ª ocorrência
    "NCC0237": "SISDIST",    # Sistemas Distribuídos
    "NCC0235": "COMPGRAF",   # Computação Gráfica
    # ── 6º período ──────────────────────────────────────────
    "NCC0234": "COMPALG",    # Complexidade de Algoritmos (período 6, sem:1)
    # ── 7º período ──────────────────────────────────────────
    "NCC0238": "COMP",       # Compiladores
    "NCC0129": "PTCC",       # Projeto de TCC
    "UCE0027": "UCE6",       # UCE 6ª ocorrência
    "NCC0127": "TGAEMP",     # Teoria Geral de Adm. e Empreendedorismo
    "NCC0239": "VISCOMP",    # Processamento de Imagem e Visão Computacional
    "NCC0240": "PROGPAR",    # Programação Paralela
    # ── 8º período ──────────────────────────────────────────
    "CAN0075": "TCC",        # Trabalho de Conclusão de Curso
    # ── Optativas identificadas no histórico de Lucas ────────
    "CAN0073": None,         # Tópicos Especiais em Sistemas Embarcados I → não mapeada
    "CAN0062": None,         # Prática de Programação para Robótica I → não mapeada
    "CAN0065": None,         # Programação para Dispositivos Móveis → não mapeada
}
```

Códigos com valor `None` devem ir para `nao_mapeadas` — o usuário mapeia via dropdown na Screen2.
Optativas disponíveis para mapeamento: OPT1, OPT2, OPT3, OPT4, OPT5, OPT6.

---

## 3. Grade curricular — `data/grade.json`

### Estrutura do arquivo

```json
{
  "curso": "Ciência da Computação",
  "curriculo": "2023.1",
  "instituicao": "UERN",
  "total_periodos": 8,
  "disciplinas": [ ... ]
}
```

### Schema de cada disciplina

```json
{
  "id": "ESTDADOS",
  "nome": "Estrutura de Dados",
  "periodo_recomendado": 3,
  "creditos": 4,
  "carga_horaria": 60,
  "semestre_oferta": 1,
  "pre_requisitos": ["TECPROG"],
  "tipo": "obrigatoria"
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador único semântico — usado em todas as referências internas |
| `nome` | string | Nome completo conforme o PPC |
| `periodo_recomendado` | int | Período do currículo (1–8) |
| `creditos` | int | Número de créditos |
| `carga_horaria` | int | CH em horas |
| `semestre_oferta` | int | 1 = semestre ímpar, 2 = semestre par |
| `pre_requisitos` | list[str] | Lista de IDs de pré-requisitos (pode ser vazia) |
| `tipo` | string | `"obrigatoria"`, `"optativa"`, `"uce"` |

### Lista completa de disciplinas

#### 1º período — semestre_oferta: 1

| ID | Nome | CR | CH | Pré-requisitos |
|---|---|---|---|---|
| FILOS | Filosofia da Ciência | 2 | 30 | [] |
| LOGMAT | Lógica Matemática Aplicada à Computação | 4 | 60 | [] |
| FISCOMP | Física para Computação | 4 | 60 | [] |
| ALGPROG | Algoritmos e Programação | 6 | 90 | [] |
| PRODTXT1 | Produção Textual | 2 | 30 | [] |
| MATFUND | Matemática Fundamental | 6 | 90 | [] |
| TECS | Tecnologia, Ética e Sociedade | 4 | 60 | [] |

#### 2º período — semestre_oferta: 2

| ID | Nome | CR | CH | Pré-requisitos |
|---|---|---|---|---|
| INGLES | Inglês Técnico | 4 | 60 | [] |
| CALC1 | Cálculo | 6 | 90 | [MATFUND] |
| METCIENT | Metodologia para o Trabalho Científico | 2 | 30 | [] |
| UCE1 | UCE (1ª ocorrência) | 4 | 60 | [] |
| TECPROG | Técnicas de Programação | 4 | 60 | [ALGPROG] |
| GEOANA | Geometria Analítica | 4 | 60 | [] |
| CIRCDIG | Circuitos Digitais | 4 | 60 | [] |

#### 3º período — semestre_oferta: 1

| ID | Nome | CR | CH | Pré-requisitos |
|---|---|---|---|---|
| ESTDADOS | Estrutura de Dados | 4 | 60 | [TECPROG] |
| PARAD | Paradigmas de Programação | 2 | 30 | [ALGOPROG] |
| ARQUCOMP | Arquitetura de Computadores | 4 | 60 | [CIRCDIG] |
| ENGSW | Engenharia de Software | 4 | 60 | [] |
| PROBEST | Probabilidade e Estatística | 4 | 60 | [] |
| ALGLIN | Álgebra Linear | 4 | 60 | [GEOANA] |
| UCE2 | UCE (2ª ocorrência) | 4 | 60 | [] |

#### 4º período — semestre_oferta: 2

| ID | Nome | CR | CH | Pré-requisitos |
|---|---|---|---|---|
| CALCNUM | Cálculo Numérico Computacional | 4 | 60 | [TECPROG] |
| APS | Análise e Projeto de Sistemas | 4 | 60 | [ENGSW] |
| BD | Banco de Dados | 4 | 60 | [] |
| POO | Programação Orientada a Objetos | 4 | 60 | [TECPROG] |
| SO | Sistemas Operacionais | 4 | 60 | [ARQUCOMP] |
| TRANSDAT | Transmissão de Dados | 4 | 60 | [FISCOMP] |
| UCE3 | UCE (3ª ocorrência) | 4 | 60 | [] |

#### 5º período — semestre_oferta: 1

| ID | Nome | CR | CH | Pré-requisitos |
|---|---|---|---|---|
| TEOCOMP | Teoria da Computação | 4 | 60 | [ESTDADOS] |
| IA | Inteligência Artificial | 6 | 90 | [APS] |
| TEOGRAF | Teoria dos Grafos | 4 | 60 | [ESTDADOS] |
| REDES | Redes de Computadores | 4 | 60 | [TRANSDAT] |
| OPT1 | Optativa I | 4 | 60 | [] |
| OPT2 | Optativa II | 4 | 60 | [] |
| UCE4 | UCE (4ª ocorrência) | 4 | 60 | [] |

#### 6º período — semestre_oferta: 2

| ID | Nome | CR | CH | Pré-requisitos |
|---|---|---|---|---|
| UCE5 | UCE (5ª ocorrência) | 4 | 60 | [] |
| PRODCIENT | Produção Científica | 2 | 30 | [] |
| OPT3 | Optativa III | 4 | 60 | [] |
| SISDIST | Sistemas Distribuídos | 4 | 60 | [REDES] |
| COMPGRAF | Computação Gráfica | 4 | 60 | [ESTDADOS] |
| COMPALG | Complexidade de Algoritmos | 4 | 60 | [ESTDADOS] |
| OPT4 | Optativa IV | 4 | 60 | [] |

#### 7º período — semestre_oferta: 1

| ID | Nome | CR | CH | Pré-requisitos |
|---|---|---|---|---|
| UCE6 | UCE (6ª ocorrência) | 4 | 60 | [] |
| PROGPAR | Programação Paralela | 2 | 30 | [SO] |
| OPT5 | Optativa V | 4 | 60 | [] |
| TGAEMP | Teoria Geral de Adm. e Empreendedorismo | 4 | 60 | [] |
| VISCOMP | Processamento de Imagem e Visão Computacional | 4 | 60 | [ESTDADOS] |
| PTCC | Projeto de Trabalho de Conclusão de Curso | 4 | 60 | [SO, SISDIST, PRODCIENT, IA, APS, COMPGRAF] |
| COMP | Compiladores | 4 | 60 | [TEOCOMP] |

#### 8º período — semestre_oferta: 2

| ID | Nome | CR | CH | Pré-requisitos |
|---|---|---|---|---|
| OPT6 | Optativa VI | 4 | 60 | [] |
| TCC | Trabalho de Conclusão de Curso | 8 | 120 | [PTCC] |

---
