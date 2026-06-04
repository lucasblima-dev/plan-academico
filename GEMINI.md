# GEMINI.md — Contexto Mestre do Projeto

> **Leia este arquivo inteiro antes de qualquer ação.**
> Este é o documento de referência central. Em caso de conflito entre este arquivo e qualquer outro, este prevalece.

---

## 1. O que é este projeto

Sistema web que gera **planejamentos acadêmicos otimizados** para alunos do curso de Ciência da Computação da UERN (Natal), aplicando **Teoria dos Grafos** sobre a matriz curricular.

O sistema recebe o PDF do histórico escolar do aluno (emitido pelo SIGAA/UERN), extrai as disciplinas aprovadas, constrói um **DAG (Grafo Dirigido Acíclico)** com as disciplinas pendentes e seus pré-requisitos, e executa dois algoritmos para gerar o planejamento semestral mais curto possível.

**Este é um trabalho acadêmico** para a disciplina NCC0233 Teoria dos Grafos — UERN 2026.1.
Prazo de entrega: **12/06/2026**.

---

## 2. Repositório

```
planejador-academico/
├── GEMINI.md          ← este arquivo (leia primeiro, sempre)
├── data/
│   ├── grade.json
│   └── README_data.md
├── docs/
│   ├── relatorio_tecnico.pdf
│   ├── BACKEND.md         ← contexto completo do backend
│   ├── FRONTEND.md        ← contexto completo do frontend
│   ├── TASKS.md           ← lista de tarefas atômicas ordenadas
│   ├── DATA.md            ← especificação dos dados (grade, dicionário SIGAA)
│   └── TESTING.md         ← critérios de aceite por módulo
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

## 3. Regras absolutas — NUNCA viole

### 3.1 Código

- **NUNCA** invente dados de disciplinas, códigos SIGAA ou pré-requisitos. Toda informação de grade está em `DATA.md` e em `data/grade.json`. Se não estiver lá, pergunte antes de prosseguir.
- **NUNCA** crie endpoints sem schema Pydantic correspondente em `models.py`.
- **NUNCA** faça chamada ao banco de dados — este sistema é **stateless**, sem banco. Os dados vêm dos arquivos JSON e do PDF por request.
- **NUNCA** instale dependências não listadas em `BACKEND.md` ou `FRONTEND.md` sem justificar explicitamente no código com um comentário.
- **NUNCA** deixe um `TODO` ou `pass` em código que já deveria estar implementado na task atual.
- **NUNCA** escreva testes que mocam o comportamento principal que está sendo testado — testes devem exercitar a lógica real.

### 3.2 Arquitetura

- **NUNCA** processe o PDF no frontend. O parse do PDF ocorre exclusivamente no backend (`pdf_parser.py`). Ver `BACKEND.md`.
- **NUNCA** exponha o JSON interno do histórico processado diretamente ao usuário sem passar pelo endpoint `/api/parse-historico` primeiro.
- **NUNCA** coloque lógica de negócio (algoritmos, validações de grafo) em `main.py`. Esse arquivo só define rotas.
- **NUNCA** use `localStorage` ou `sessionStorage` no frontend.
- **NUNCA** faça chamadas diretas ao sistema de arquivos do backend a partir do frontend.

### 3.3 Qualidade

- **SEMPRE** escreva docstrings em todas as funções públicas Python.
- **SEMPRE** escreva comentários JSDoc nos componentes e funções TypeScript exportadas.
- **SEMPRE** valide o DAG com `nx.is_directed_acyclic_graph(G)` antes de executar qualquer algoritmo.
- **SEMPRE** trate o caso em que o parser retorna disciplinas `nao_mapeadas` — nunca ignore silenciosamente.
- **SEMPRE** configure CORS no FastAPI antes de qualquer outra coisa no startup.

---

## 4. Stack tecnológica (imutável)

| Camada | Tecnologia | Versão mínima |
|---|---|---|
| Backend | Python | 3.11 |
| Framework API | FastAPI + Uvicorn | 0.110+ |
| Grafos | NetworkX | 3.2+ |
| Parser PDF | pdfplumber | 0.10+ |
| Validação | Pydantic v2 | 2.0+ |
| Frontend | React + TypeScript | React 18, TS 5 |
| Build tool | Vite | 5.0+ |
| Visualização de grafo | React Flow | 11+ |
| Estilização | Tailwind CSS | 3.4+ |
| HTTP client | Axios | 1.6+ |
| Containerização | Docker + Docker Compose | Compose v2 |
| Testes Python | pytest | 7+ |

**Não substitua nenhuma dessas tecnologias por alternativas**, mesmo que pareça mais simples. A escolha é intencional e documentada no relatório técnico.

---

## 5. Os dois casos do problema (núcleo do sistema)

O sistema deve gerar planejamentos para **dois cenários obrigatórios**:

| Caso | Restrições ativas |
|---|---|
| **Caso 1** | Pré-requisitos + limite por semestre + semestre de oferta (ímpar/par) |
| **Caso 2** | Pré-requisitos + limite por semestre (sem restrição de oferta — todas as disciplinas disponíveis em qualquer semestre) |

Ambos os casos devem ser executados pelos **dois algoritmos**:

| Algoritmo | Estratégia |
|---|---|
| **Algoritmo 1** | Kahn's Algorithm com heurística gulosa (prioridade por out-degree) |
| **Algoritmo 2** | BFS por níveis com prioridade por Caminho Crítico (CPM) |

O resultado final expõe **4 combinações**: Caso1/Algo1, Caso1/Algo2, Caso2/Algo1, Caso2/Algo2.

---

## 6. Fluxo de dados completo

```
1. Usuário faz upload do PDF do histórico SIGAA
      ↓
2. POST /api/parse-historico (multipart/form-data, campo: "historico")
      ↓
3. pdf_parser.py extrai a tabela do SIGAA com pdfplumber
   - Filtra situações: APR, CUMP, DISP → aprovadas
   - Ignora: MATR, REP, REPF, REPMF, REPN, REPNF, TRANC
   - Mapeia código SIGAA → ID do grade.json via SIGAA_PARA_ID
   - Detecta semestre_atual a partir de "Período Letivo Atual"
      ↓
4. API retorna HistoricoParseado:
   { nome_aluno, matricula, semestre_atual, disciplinas_aprovadas, nao_mapeadas }
      ↓
5. Frontend exibe HistoricoPreview — usuário confirma ou edita
      ↓
6. POST /api/planejar
   { historico: HistoricoParseado, max_disciplinas: int (5-7) }
      ↓
7. graph_builder.py constrói DAG com NetworkX
   - Carrega grade.json do disco (fixo no backend)
   - Remove disciplinas aprovadas do grafo
   - Valida DAG
      ↓
8. Executa os 4 planejamentos (2 casos × 2 algoritmos)
      ↓
9. API retorna ResultadoPlanejar com os 4 planos + metadados do grafo
      ↓
10. Frontend renderiza: PlanTable, GraphView, CompareView
```

---

## 7. Estrutura de módulos do backend

```
backend/app/
├── main.py            # SOMENTE rotas FastAPI — sem lógica de negócio
├── models.py          # Todos os schemas Pydantic de entrada e saída
├── pdf_parser.py      # Parse do histórico SIGAA via pdfplumber
├── graph_builder.py   # Construção do DAG com NetworkX
├── algorithm_kahn.py  # Algoritmo 1: Kahn + heurística gulosa
├── algorithm_bfs.py   # Algoritmo 2: BFS + CPM
└── utils.py           # Helpers: validação, serialização, logging
```

---

## 8. Estrutura de componentes do frontend

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Com toggle de Dark/Light mode
│   │   └── ThemeProvider.tsx    # Gerencia a classe 'dark' no <html>
│   ├── screens/
│   │   ├── Screen1Upload.tsx    # Drag-and-drop animado
│   │   ├── Screen2Preview.tsx   # Tabela de conciliação (Match de Optativas/UCEs)
│   │   └── Screen3Results.tsx   # Wrapper das abas de planejamento
│   └── views/                   # (Renderizadas dentro da Screen3)
│       ├── PlanView.tsx         # PlanTable modernizada com clsx
│       ├── GraphView.tsx        # DAG com suporte a tema escuro
│       └── CompareView.tsx      # Tabelas e destaques comparativos
├── services/
│   └── api.ts                # Todas as chamadas HTTP — sem fetch direto nos componentes
├── types/
│   └── index.ts              # Interfaces TypeScript — espelha os schemas Pydantic
├── hooks/
│   └── usePlanner.ts         # Estado global do fluxo (upload → preview → planejamento)
├── App.tsx
└── main.tsx
```

---

## 9. Ports e configuração de rede

| Serviço | Porta local | Container |
|---|---|---|
| Backend (FastAPI) | 8000 | backend:8000 |
| Frontend (Vite dev) | 5173 | frontend:5173 |

- O frontend acessa o backend via `http://localhost:8000` em desenvolvimento.
- Em Docker Compose, usa a rede interna: `http://backend:8000`.
- A variável `VITE_API_URL` controla o endpoint base.
- CORS no backend deve permitir `http://localhost:5173` explicitamente.

---

## 10. O que este sistema NÃO faz

- Não tem autenticação ou login.
- Não persiste dados entre sessões (sem banco, sem localStorage).
- Não valida se a grade JSON está de acordo com o PPC oficial — é responsabilidade do operador.
- Não trata co-requisitos ou equivalências além do dicionário SIGAA_PARA_ID.
- Não suporta múltiplas grades curriculares simultaneamente.
- Não exporta o planejamento como PDF ou Excel (fora do escopo).

---

## 11. Antes de marcar qualquer task como concluída

1. O código compila/executa sem erros?
2. A docstring/JSDoc está presente?
3. O teste correspondente em `TESTING.md` passa?
4. O comportamento está de acordo com `BACKEND.md` ou `FRONTEND.md`?
5. Nenhuma regra da Seção 3 foi violada?

Se qualquer resposta for "não", a task **não está concluída**.
