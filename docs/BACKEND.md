# BACKEND.md — Especificação Completa do Backend

> Leia `GEMINI.md` antes deste arquivo.
> Este documento é a fonte da verdade para tudo relacionado ao backend e infraestrutura Docker.

---

## 1. Responsabilidades do backend

- Receber o PDF do histórico SIGAA e extrair as disciplinas aprovadas.
- Expor um preview do histórico extraído para confirmação do usuário.
- Carregar a grade curricular fixa (`data/grade.json`).
- Construir o DAG de disciplinas pendentes.
- Executar os dois algoritmos de planejamento para os dois casos.
- Retornar os resultados de forma estruturada para o frontend.

**O backend NÃO tem banco de dados. É completamente stateless.**

---

## 2. Dependências (`backend/requirements.txt`)

```
fastapi==0.110.0
uvicorn[standard]==0.27.0
networkx==3.2.1
pdfplumber==0.10.4
pydantic==2.6.0
python-multipart==0.0.9
pytest==7.4.0
httpx==0.26.0
```

- `python-multipart` é obrigatório para `UploadFile` funcionar no FastAPI.
- `httpx` é necessário para os testes do `TestClient` do FastAPI.
- Não adicione dependências sem atualizar este arquivo.

---

## 3. Estrutura de arquivos

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── pdf_parser.py
│   ├── graph_builder.py
│   ├── algorithm_kahn.py
│   ├── algorithm_bfs.py
│   └── utils.py
├── data/
│   └── grade.json          # grade curricular — NÃO modificar via código
├── samples/                # PDFs de histórico para testes
│   └── historico_lucas.pdf
├── tests/
│   ├── __init__.py
│   ├── test_pdf_parser.py
│   ├── test_graph_builder.py
│   ├── test_algorithm_kahn.py
│   └── test_algorithm_bfs.py
├── Dockerfile
└── requirements.txt
```

---

## 4. `main.py` — Rotas FastAPI

Contém **somente** a definição de rotas e o startup da aplicação. Nenhuma lógica de negócio.

### Startup

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Planejador Acadêmico", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Endpoints obrigatórios

#### `POST /api/parse-historico`

- **Entrada:** `UploadFile` (campo `historico`, tipo `application/pdf`)
- **Saída:** `HistoricoParseado`
- **Erro 422:** se o arquivo não for PDF
- **Erro 500:** se o pdfplumber falhar na extração (retornar mensagem descritiva)
- Chama `pdf_parser.parse_historico(pdf_bytes)` — nenhuma lógica própria

#### `POST /api/planejar`

- **Entrada:** `PlanejamentoRequest` (body JSON)
- **Saída:** `ResultadoPlanejar`
- **Erro 422:** se `max_disciplinas` não estiver entre 5 e 7
- **Erro 400:** se o DAG contiver ciclos (retornar lista dos nós envolvidos)
- Chama `graph_builder`, depois os dois algoritmos — nenhuma lógica própria

#### `GET /api/grade`

- **Saída:** conteúdo do `grade.json` como JSON
- Útil para o frontend pré-carregar os nomes das disciplinas antes do planejamento

#### `GET /health`

- **Saída:** `{"status": "ok"}`
- Usado pelo Docker Compose healthcheck

---

## 5. `models.py` — Schemas Pydantic

Todos os tipos de entrada e saída da API são definidos aqui. O frontend deve espelhar esses tipos em `types/index.ts`.

```python
from pydantic import BaseModel, Field
from typing import Optional

# ── Entrada ──────────────────────────────────────────────────────────────────

class PlanejamentoRequest(BaseModel):
    historico: "HistoricoParseado"
    max_disciplinas: int = Field(..., ge=5, le=7)
    aprovadas_manualmente: list[str] = Field(default_factory=list) 
    # Recebe os IDs (ex: "OPT1", "UCE6") que o aluno conciliou na Tela 2

# ── Saída do parser ───────────────────────────────────────────────────────────

class DisciplinaNaoMapeada(BaseModel):
    codigo_sigaa: str
    nome_sigaa: str
    situacao: str

class HistoricoParseado(BaseModel):
    nome_aluno: str
    matricula: str
    semestre_atual: int          # 1 (ímpar) ou 2 (par)
    disciplinas_aprovadas: list[str]  # lista de IDs do grade.json
    nao_mapeadas: list[DisciplinaNaoMapeada]

# ── Saída do planejamento ────────────────────────────────────────────────────

class DisciplinaPlano(BaseModel):
    id: str
    nome: str
    carga_horaria: int
    creditos: int
    semestre_oferta: int
    tipo: str

class SemestrePlano(BaseModel):
    numero: int                  # 1, 2, 3... (ordinal do planejamento)
    tipo_semestre: int           # 1 (ímpar) ou 2 (par)
    disciplinas: list[DisciplinaPlano]
    total_disciplinas: int
    total_carga_horaria: int

class Plano(BaseModel):
    caso: int                    # 1 ou 2
    algoritmo: int               # 1 ou 2
    semestres: list[SemestrePlano]
    total_semestres: int
    total_disciplinas: int
    total_carga_horaria: int

class NoGrafo(BaseModel):
    id: str
    nome: str
    periodo_recomendado: int
    semestre_oferta: int
    aprovada: bool
    disponivel: bool             # sem pré-requisitos pendentes
    caminho_critico: bool        # está no caminho crítico do DAG

class ArestaGrafo(BaseModel):
    origem: str                  # id da disciplina pré-requisito
    destino: str                 # id da disciplina dependente

class ResultadoPlanejar(BaseModel):
    planos: list[Plano]          # sempre 4 planos: 2 casos x 2 algoritmos
    nos: list[NoGrafo]           # todos os nós do grafo (aprovados + pendentes)
    arestas: list[ArestaGrafo]
    disciplinas_pendentes: int
    disciplinas_aprovadas: int
```

---

## 6. `pdf_parser.py` — Parser do histórico SIGAA

### Responsabilidade única

Receber bytes de um PDF do SIGAA e retornar um `HistoricoParseado`.

### Situações consideradas aprovadas

```python
SITUACOES_APROVADAS = {"APR", "CUMP", "DISP", "APRN", "TRANS", "INCORP"}
```

### Dicionário de mapeamento (completo — não modifique sem motivo)

O dicionário foi construído a partir do histórico real de Lucas Bezerra de Lima (matrícula 20240021666, emitido 26/05/2026).

```python
SIGAA_PARA_ID: dict[str, str] = {
    # ── 1º período ──────────────────────────────────────────────────────────
    "NCC0211": "ALGPROG",    # Algoritmos e Programação (código original)
    "CAN0077": "ALGPROG",    # Algoritmos e Programação (equivalência CAN)
    "NCC0109": "MATFUND",    # Matemática Fundamental
    "NCC0212": "FILOS",      # Filosofia da Ciência
    "NCC0214": "LOGMAT",     # Lógica Matemática Aplicada à Computação
    "NCC0213": "FISCOMP",    # Física para Computação
    "NCC0215": "TECS",       # Tecnologia, Ética e Sociedade
    "NCC0108": "PRODTXT1",   # Produção Textual  (situação CUMP)
    # ── 2º período ──────────────────────────────────────────────────────────
    "NCC0179": "INGLES",     # Inglês Técnico
    "NCC0116": "CALC1",      # Cálculo  (situação CUMP)
    "NCC0114": "METCIENT",   # Metodologia para o Trabalho Científico
    "NCC0218": "TECPROG",    # Técnicas de Programação
    "NCC0217": "GEOANA",     # Geometria Analítica
    "NCC0216": "CIRCDIG",    # Circuitos Digitais
    "UCE0002": "UCE1",       # UCE 1ª ocorrência
    # ── 3º período ──────────────────────────────────────────────────────────
    "NCC0222": "ESTDADOS",   # Estrutura de Dados
    "NCC0223": "PARAD",      # Paradigmas de Programação
    "NCC0220": "ARQUCOMP",   # Arquitetura de Computadores
    "NCC0221": "ENGSW",      # Engenharia de Software
    "NCC0224": "PROBEST",    # Probabilidade e Estatística (situação CUMP)
    "NCC0219": "ALGLIN",     # Álgebra Linear
    "UCE0023": "UCE2",       # UCE 2ª ocorrência
    # ── 4º período ──────────────────────────────────────────────────────────
    "NCC0015": "CALCNUM",    # Cálculo Numérico Computacional
    "NCC0225": "APS",        # Análise e Projeto de Sistemas
    "NCC0226": "BD",         # Banco de Dados
    "NCC0227": "POO",        # Programação Orientada a Objetos
    "NCC0228": "SO",         # Sistemas Operacionais
    "NCC0229": "TRANSDAT",   # Transmissão de Dados
    "UCE0024": "UCE3",       # UCE 3ª ocorrência
    # ── 5º período ──────────────────────────────────────────────────────────
    "NCC0230": "IA",         # Inteligência Artificial
    "NCC0232": "TEOCOMP",    # Teoria da Computação
    "NCC0231": "REDES",      # Redes de Computadores
    "UCE0025": "UCE4",       # UCE 4ª ocorrência (atualmente matriculado)
    # ── 6º período ──────────────────────────────────────────────────────────
    "NCC0233": "TEOGRAF",    # Teoria dos Grafos (matriculado)
    "NCC0236": "PRODCIENT",  # Produção Científica
    "UCE0026": "UCE5",       # UCE 5ª ocorrência (pendente)
    "NCC0237": "SISDIST",    # Sistemas Distribuídos
    "NCC0235": "COMPGRAF",   # Computação Gráfica
    # ── 7º período ──────────────────────────────────────────────────────────
    "NCC0234": "COMPALG",    # Complexidade de Algoritmos
    "NCC0238": "COMP",       # Compiladores
    "NCC0129": "PTCC",       # Projeto de TCC
    "UCE0027": "UCE6",       # UCE 6ª ocorrência (pendente)
    "NCC0127": "TGAEMP",     # Teoria Geral de Adm. e Empreendedorismo
    "NCC0239": "VISCOMP",    # Processamento de Imagem e Visão Computacional
    "NCC0240": "PROGPAR",    # Programação Paralela
    # ── 8º período ──────────────────────────────────────────────────────────
    "CAN0075": "TCC",        # Trabalho de Conclusão de Curso
    # ── Optativas identificadas no histórico de Lucas ────────────────────────
    "CAN0073": "OPT_EMBARCADOS",  # Tópicos Especiais em Sistemas Embarcados I
    "CAN0062": "OPT_ROBOTICA",    # Prática de Programação para Robótica I
    "CAN0065": "OPT_MOBILE",      # Programação para Dispositivos Móveis
}
```

### Algoritmo de extração

```python
def parse_historico(pdf_bytes: bytes) -> HistoricoParseado:
    """
    Extrai o histórico escolar de um PDF do SIGAA/UERN.

    Estratégia:
    1. pdfplumber abre o PDF e extrai tabelas de todas as páginas.
    2. Identifica a tabela de componentes curriculares pela presença
       do cabeçalho "Componente Curricular" e "Situação".
    3. Itera pelas linhas, extrai o código NCC/UCE/CAN e a situação.
    4. Filtra situações aprovadas e mapeia via SIGAA_PARA_ID.
    5. Extrai nome, matrícula e semestre_atual dos metadados do PDF.

    O campo "Período Letivo Atual" na página 1 contém o número do
    período atual do aluno (ex: "5"). Se for ímpar → semestre_atual=1,
    se for par → semestre_atual=2.
    """
```

### Extração do código da disciplina

O campo "Componente Curricular" no SIGAA tem o formato:

```
NCC0222  Estrutura de Dados (08052321)
         MSc. BRUNO CRUZ DE OLIVEIRA (90h)
```

O código relevante é o **prefixo da linha** (NCC0222, UCE0023, CAN0077).
Use regex: `r'^([A-Z]{2,4}\d{4})'` para extrair o código.

### Tratamento de não mapeadas

Se um código não estiver no dicionário, adicione à lista `nao_mapeadas` com:

- `codigo_sigaa`: o código extraído (ex: "NCC0999")
- `nome_sigaa`: o nome completo da disciplina conforme o PDF
- `situacao`: a situação original (ex: "APR")

**Nunca ignore silenciosamente um código não mapeado.**

---

## 7. `graph_builder.py` — Construção do DAG

```python
import networkx as nx
import json
from pathlib import Path

GRADE_PATH = Path(__file__).parent.parent / "data" / "grade.json"

def build_graph(disciplinas_aprovadas: list[str]) -> nx.DiGraph:
    """
    Constrói o DAG da grade curricular removendo as disciplinas aprovadas.

    Args:
        disciplinas_aprovadas: lista de IDs do grade.json já concluídas.

    Returns:
        nx.DiGraph com as disciplinas pendentes e suas arestas de pré-requisito.
        Cada nó tem os atributos: nome, carga_horaria, creditos,
        semestre_oferta, periodo_recomendado, tipo.

    Raises:
        ValueError: se o grafo resultante contiver ciclos.
    """
```

> **Nota de Implementação (Conciliação):** A função `build_graph` ou a rota em `main.py` deve garantir que a lista `aprovadas_manualmente` vinda do payload seja concatenada com a lista `disciplinas_aprovadas` extraída do PDF. Isso assegura que optativas mapeadas manualmente pelo usuário sejam removidas do grafo de pendências.

**Passos obrigatórios dentro de `build_graph`:**

1. Carregar `grade.json` do disco.
2. Criar `nx.DiGraph()`.
3. Adicionar todos os nós com seus atributos.
4. Adicionar arestas `(prerequisito → disciplina)` para cada pré-requisito.
5. Remover nós das disciplinas aprovadas (e suas arestas, automaticamente pelo NetworkX).
6. Verificar `nx.is_directed_acyclic_graph(G)` — lançar `ValueError` se falso.
7. Retornar o grafo.

---

## 8. `algorithm_kahn.py` — Algoritmo 1

### Estratégia: Ordenação Topológica (Kahn) + Heurística Gulosa

O algoritmo de Kahn processa o grafo em "gerações" de nós com in-degree zero. A heurística gulosa ordena cada geração pelo **out-degree** do nó (decrescente) — priorizando as disciplinas que desbloqueiam mais outras.

```python
def kahn_guloso(
    G: nx.DiGraph,
    semestre_atual: int,
    max_disciplinas: int,
    respeitar_oferta: bool,
) -> list[SemestrePlano]:
    """
    Gera planejamento usando ordenação topológica com heurística gulosa.

    Args:
        G: DAG das disciplinas pendentes (não modifica o grafo original).
        semestre_atual: 1 (ímpar) ou 2 (par) — primeiro semestre do plano.
        max_disciplinas: máximo de disciplinas por semestre (5–7).
        respeitar_oferta: True = Caso 1, False = Caso 2.

    Returns:
        Lista de SemestrePlano ordenada cronologicamente.

    Complexidade: O(V + E)
    Otimalidade: heurística — boa aproximação, não garante ótimo global.
    """
```

**Pseudocódigo interno:**

```
G_trabalho ← cópia de G (não modificar o original)
in_degree ← {v: G_trabalho.in_degree(v) for v em G_trabalho}
semestre ← semestre_atual
planejamento ← []

enquanto G_trabalho não estiver vazio:
    disponíveis ← [v | in_degree[v] == 0]

    se respeitar_oferta:
        disponíveis ← [v | v.semestre_oferta == semestre % 2 ou semestre % 2 == 0...]
        # ímpar → semestre_oferta == 1, par → semestre_oferta == 2

    se disponíveis estiver vazio e G_trabalho não estiver vazio:
        # deadlock: disciplinas bloqueadas por oferta — avançar semestre
        semestre += 1
        continuar

    ordenar disponíveis por out_degree(v) decrescente  ← heurística
    selecionados ← disponíveis[:max_disciplinas]

    adicionar SemestrePlano(semestre, selecionados) ao planejamento
    remover selecionados de G_trabalho
    atualizar in_degree dos sucessores

    semestre += 1

retornar planejamento
```

---

## 9. `algorithm_bfs.py` — Algoritmo 2

### Estratégia: BFS por níveis + Caminho Crítico (CPM)

O CPM calcula, para cada nó, o **comprimento do maior caminho** até qualquer folha do grafo. Isso representa quantos "passos" ainda são necessários a partir dessa disciplina. Nós com CPM maior têm prioridade absoluta na alocação.

```python
def calcular_cpm(G: nx.DiGraph) -> dict[str, int]:
    """
    Calcula o comprimento do maior caminho de cada nó até qualquer folha.

    Usa DFS reversa em ordem topológica reversa.
    Complexidade: O(V + E).
    """

def bfs_cpm(
    G: nx.DiGraph,
    semestre_atual: int,
    max_disciplinas: int,
    respeitar_oferta: bool,
) -> list[SemestrePlano]:
    """
    Gera planejamento usando BFS por níveis com prioridade por caminho crítico.

    Args: (idênticos ao kahn_guloso)

    Returns: Lista de SemestrePlano.

    Complexidade: O(V log V + E)
    Otimalidade: mais próximo do ótimo que o Algoritmo 1.
    """
```

**Diferença chave em relação ao Algoritmo 1:**

- No Algoritmo 1, a prioridade é `out_degree(v)` — quantas disciplinas um nó desbloqueia diretamente.
- No Algoritmo 2, a prioridade é `cpm[v]` — quantos semestres ainda são necessários a partir de v.
- O Algoritmo 2 tende a gerar planejamentos iguais ou melhores que o Algoritmo 1.

---

## 10. `utils.py` — Helpers

```python
def grafo_para_nos_arestas(
    G_completo: nx.DiGraph,
    disciplinas_aprovadas: list[str],
    cpm: dict[str, int],
) -> tuple[list[NoGrafo], list[ArestaGrafo]]:
    """
    Serializa o grafo completo (aprovadas + pendentes) para o schema
    NoGrafo/ArestaGrafo usado pelo frontend no GraphView.
    """

def validar_grade_json(grade: dict) -> list[str]:
    """
    Valida o grade.json verificando:
    - Todos os IDs em pre_requisitos existem como disciplinas na lista.
    - Nenhum campo obrigatório está faltando.
    Retorna lista de erros encontrados (vazia se válido).
    """
```

---

## 11. `Dockerfile` do backend

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 12. `docker-compose.yml`

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/data:/app/data:ro
      - ./backend/samples:/app/samples:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      backend:
        condition: service_healthy
```

---

## 13. Variáveis de ambiente

| Variável | Onde | Valor padrão | Descrição |
|---|---|---|---|
| `GRADE_PATH` | backend | `./data/grade.json` | Caminho para o arquivo da grade |
| `VITE_API_URL` | frontend | `http://localhost:8000` | URL base do backend |

---

## 14. Como rodar localmente (sem Docker)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

---

## 15. Como rodar com Docker Compose

```bash
# Na raiz do repositório
docker compose up --build

# Backend disponível em: http://localhost:8000
# Frontend disponível em: http://localhost:5173
# Documentação da API: http://localhost:8000/docs
```
