# TESTING.md — Critérios de Aceite por Módulo

> Uma task só está concluída quando **todos** os critérios do seu módulo passam.
> Execute os testes antes de marcar qualquer task como `[x]` em `TASKS.md`.

---

## Como rodar os testes

```bash
# Todos os testes do backend
cd backend
pytest tests/ -v

# Módulo específico
pytest tests/test_pdf_parser.py -v

# Com cobertura (opcional, mas recomendado)
pytest tests/ --cov=app --cov-report=term-missing
```

---

## Módulo: `pdf_parser.py`

Execute com: `pytest tests/test_pdf_parser.py -v`

| # | Critério | Como verificar |
|---|---|---|
| P1 | Extrai `nome_aluno` corretamente | `resultado.nome_aluno == "Lucas Bezerra de Lima"` |
| P2 | Extrai `matricula` corretamente | `resultado.matricula == "20240021666"` |
| P3 | Detecta `semestre_atual` corretamente | `resultado.semestre_atual == 1` (Período 5 = ímpar) |
| P4 | Extrai todas as 29 disciplinas aprovadas | `len(resultado.disciplinas_aprovadas) == 29` |
| P5 | CALC1 está na lista (situação CUMP) | `"CALC1" in resultado.disciplinas_aprovadas` |
| P6 | PRODTXT1 está na lista (situação CUMP) | `"PRODTXT1" in resultado.disciplinas_aprovadas` |
| P7 | PROBEST está na lista (situação CUMP) | `"PROBEST" in resultado.disciplinas_aprovadas` |
| P8 | IA **não** está na lista (situação MATR) | `"IA" not in resultado.disciplinas_aprovadas` |
| P9 | TEOCOMP **não** está na lista (MATR) | `"TEOCOMP" not in resultado.disciplinas_aprovadas` |
| P10 | Optativas CAN aparecem em `nao_mapeadas` | `len(resultado.nao_mapeadas) >= 2` |
| P11 | Falha com PDF inválido (não-SIGAA) | Lança exceção ou retorna erro descritivo — nunca retorna lista vazia silenciosamente |
| P12 | Não inclui disciplinas com MATR em `disciplinas_aprovadas` | Verificar manualmente os 6 MATR do histórico de Lucas |

---

## Módulo: `graph_builder.py`

Execute com: `pytest tests/test_graph_builder.py -v`

| # | Critério | Como verificar |
|---|---|---|
| G1 | Com lista vazia: grafo tem todos os nós da grade | `G.number_of_nodes() == total_disciplinas_da_grade` |
| G2 | Com aprovadas de Lucas: nós corretos no grafo | Verificar lista de pendentes em `DATA.md` seção 1 |
| G3 | Grafo é DAG em todos os casos | `nx.is_directed_acyclic_graph(G) == True` |
| G4 | Arestas corretas: TECPROG → ESTDADOS existe | `G.has_edge("TECPROG", "ESTDADOS") == True` (se ambos pendentes) |
| G5 | Atributo `semestre_oferta` presente em todos os nós | `all("semestre_oferta" in G.nodes[n] for n in G.nodes)` |
| G6 | Atributo `carga_horaria` presente em todos os nós | `all("carga_horaria" in G.nodes[n] for n in G.nodes)` |
| G7 | Disciplinas aprovadas não têm nó no grafo | `"ALGPROG" not in G.nodes` (Lucas aprovou ALGPROG) |
| G8 | Lança ValueError com grade ciclica (grade sintética) | Criar grade de teste com ciclo artificial e verificar exceção |

---

## Módulo: `algorithm_kahn.py`

Execute com: `pytest tests/test_algorithm_kahn.py -v`

| # | Critério | Como verificar |
|---|---|---|
| K1 | Ordem topológica respeitada (Caso 2) | Para todo SemestrePlano S[i], nenhuma disciplina em S[i] tem pré-requisito em S[i] ou S[j>i] |
| K2 | Total de disciplinas correto | `sum(s.total_disciplinas for s in plano) == G.number_of_nodes()` |
| K3 | max_disciplinas respeitado em todos os semestres | `all(s.total_disciplinas <= max_disciplinas for s in plano)` |
| K4 | Caso 1: semestre_oferta respeitado | Disciplinas com `semestre_oferta=1` só aparecem em semestres ímpares do plano |
| K5 | Caso 1: disciplinas com semestre_oferta=2 só em pares | Verificar todas as disciplinas do plano Caso 1 |
| K6 | Planejamento não termina sem alocar todas as disciplinas | `sum(s.total_disciplinas for s in plano) == G.number_of_nodes()` |
| K7 | Caso 2 gera plano com ≤ semestres que Caso 1 | `total_semestres_caso2 <= total_semestres_caso1` |
| K8 | Com grafo vazio: retorna lista vazia | `kahn_guloso(empty_G, 1, 6, False) == []` |

---

## Módulo: `algorithm_bfs.py`

Execute com: `pytest tests/test_algorithm_bfs.py -v`

Os critérios K1–K8 se aplicam integralmente ao `bfs_cpm`. Adicionalmente:

| # | Critério | Como verificar |
|---|---|---|
| B1 | `calcular_cpm` retorna dict com todos os nós do grafo | `set(cpm.keys()) == set(G.nodes)` |
| B2 | CPM de nó folha == 1 | Para toda folha f: `cpm[f] == 1` |
| B3 | CPM de nó com 1 sucessor == cpm[sucessor] + 1 | Verificar com grafo linear sintético |
| B4 | Caso 2: `bfs_cpm` gera plano com total_semestres ≤ `kahn_guloso` | Comparar com mesmo input, mesmo max_disciplinas |
| B5 | Disciplinas do caminho crítico aparecem no primeiro semestre possível | TCC deve aparecer no último semestre — PTCC no penúltimo |

---

## Módulo: Integração da API

Execute com: `pytest tests/` ou manualmente via `curl`/Swagger em `http://localhost:8000/docs`

| # | Endpoint | Critério |
|---|---|---|
| A1 | `GET /health` | Retorna `{"status": "ok"}` com HTTP 200 |
| A2 | `POST /api/parse-historico` com PDF válido | Retorna `HistoricoParseado` com HTTP 200 |
| A3 | `POST /api/parse-historico` com arquivo não-PDF | Retorna HTTP 422 com mensagem descritiva |
| A4 | `POST /api/planejar` com histórico de Lucas, max=6 | Retorna `ResultadoPlanejar` com 4 planos, HTTP 200 |
| A5 | `POST /api/planejar` com max_disciplinas=4 | Retorna HTTP 422 (fora do range 5–7) |
| A6 | `POST /api/planejar` com max_disciplinas=8 | Retorna HTTP 422 |
| A7 | `GET /api/grade` | Retorna o conteúdo do grade.json com HTTP 200 |
| A8 | Verificar CORS | `OPTIONS http://localhost:8000/api/planejar` retorna header `Access-Control-Allow-Origin` |

---

## Frontend: critérios de aceitação manual

Estes critérios são verificados manualmente no browser:

| # | Critério |
|---|---|
| F1 | Upload de arquivo não-PDF exibe mensagem de erro — não envia ao backend |
| F2 | Upload de PDF válido exibe loading spinner |
| F3 | HistoricoPreview exibe nome, matrícula e semestre corretos |
| F4 | Disciplinas não mapeadas aparecem destacadas em amarelo/laranja |
| F5 | Remover uma disciplina do preview a remove corretamente do estado |
| F6 | Slider de max_disciplinas só aceita 5, 6 ou 7 |
| F7 | PlanTable exibe semestres com disciplinas corretas |
| F8 | Toggle Caso 1/Caso 2 altera a tabela exibida sem recarregar |
| F9 | Toggle Algo 1/Algo 2 altera a tabela exibida sem recarregar |
| F10 | GraphView renderiza nós com cores corretas por estado |
| F11 | Hover sobre nó do grafo exibe tooltip com informações da disciplina |
| F12 | CompareView exibe as 4 colunas com o menor número destacado em verde |
| F13 | Botão "Novo Planejamento" retorna à tela de upload limpa |
| F14 | Nenhum erro no console do browser durante o fluxo completo |
| F15 | Interface funciona em resolução 1280×720 sem overflow horizontal |

---

## Checklist pré-entrega

Execute este checklist completo no dia 11/06 (dia 10 do projeto):

- [ ] `pytest tests/ -v` — 100% passing
- [ ] `tsc --noEmit` no frontend — zero erros TypeScript
- [ ] `docker compose up --build` — ambos os serviços sobem sem erro
- [ ] Fluxo completo no browser com o PDF de Lucas — sem erros no console
- [ ] Fluxo completo com o segundo histórico (desnivelado) — resultados coerentes
- [ ] Todos os critérios F1–F15 verificados manualmente
- [ ] Docstrings em todas as funções públicas Python
- [ ] Comentários JSDoc em todos os componentes exportados TypeScript
- [ ] `README.md` tem instruções de instalação funcionando
- [ ] Repositório está público no GitHub
- [ ] Relatório técnico salvo em `docs/relatorio_tecnico.pdf`

---
