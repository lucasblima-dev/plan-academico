# TASKS.md — Lista de Tarefas Atômicas

> **Para o agente:** execute uma task por vez. Só avance para a próxima depois que os critérios de aceite da task atual passarem (ver `TESTING.md`). Nunca pule etapas.
>
> **Legenda de status:** `[ ]` pendente · `[x]` concluída · `[~]` em progresso

---

## FASE 0 — Scaffolding (execute primeiro, sem exceção)

- [ ] **T00** — Criar a estrutura de diretórios completa conforme `GEMINI.md` seção 2. Criar todos os `__init__.py` necessários no backend. Criar o `.gitignore` com: `__pycache__/`, `*.pyc`, `venv/`, `node_modules/`, `.env`, `*.pdf` (exceto samples/).
- [ ] **T01** — Criar `backend/requirements.txt` com as dependências exatas de `BACKEND.md` seção 2.
- [ ] **T02** — Criar `frontend/` com Vite + React + TypeScript. Instalar dependências de `FRONTEND.md` seção 2. Configurar Tailwind conforme especificado.
- [ ] **T03** — Criar `frontend/.env` com `VITE_API_URL=http://localhost:8000`.
- [ ] **T04** — Criar `frontend/src/types/index.ts` com todas as interfaces de `FRONTEND.md` seção 4.
- [ ] **T05** — Criar `README.md` na raiz com: descrição do projeto, instruções de setup com Docker Compose e sem Docker.

**Critério de aceite T00–T05:** `docker compose build` executa sem erros (mesmo que os serviços não façam nada ainda).

---

## FASE 1 — Backend: dados e modelos

- [ ] **T10** — Copiar `data/grade.json` (já existente) para `backend/data/grade.json`. Implementar `utils.validar_grade_json()` e executar a validação no startup — logar warnings se houver inconsistências.
- [ ] **T11** — Implementar `backend/app/models.py` com todos os schemas Pydantic de `BACKEND.md` seção 5. Não deve importar nada de outros módulos do projeto.
- [ ] **T12** — Criar `backend/app/main.py` com: instância FastAPI, CORS configurado, e os 4 endpoints como stubs que retornam `{"status": "not implemented"}`. Verificar que `GET /health` retorna `{"status": "ok"}`.

**Critério de aceite T10–T12:** `uvicorn app.main:app --reload` sobe sem erros. `curl http://localhost:8000/health` retorna 200.

---

## FASE 2 — Backend: parser PDF

- [ ] **T20** — Implementar `backend/app/pdf_parser.py`:
  - Dicionário `SIGAA_PARA_ID` completo conforme `BACKEND.md` seção 6.
  - Set `SITUACOES_APROVADAS` conforme especificado.
  - Função `parse_historico(pdf_bytes: bytes) -> HistoricoParseado`.
  - Extração de: nome_aluno, matricula, semestre_atual, disciplinas aprovadas, nao_mapeadas.
  - Código regex para extrair o prefixo do código SIGAA.
- [ ] **T21** — Implementar `backend/tests/test_pdf_parser.py` usando o arquivo `backend/samples/historico_lucas.pdf`. Verificar:
  - `disciplinas_aprovadas` contém exatamente os IDs esperados (lista em `DATA.md`).
  - `semestre_atual == 1` (Período Letivo Atual = 5, ímpar).
  - `nao_mapeadas` contém as optativas CAN0073, CAN0062, CAN0065 (não estão na grade obrigatória).
  - `nome_aluno == "Lucas Bezerra de Lima"`.
- [ ] **T22** — Conectar `pdf_parser` ao endpoint `POST /api/parse-historico` em `main.py`.

**Critério de aceite T20–T22:** `pytest tests/test_pdf_parser.py` passa 100%.

---

## FASE 3 — Backend: grafo e algoritmos

- [ ] **T30** — Implementar `backend/app/graph_builder.py`:
  - `build_graph(disciplinas_aprovadas) -> nx.DiGraph`.
  - Carrega `grade.json`, adiciona nós com atributos, adiciona arestas.
  - Remove nós aprovados.
  - Valida DAG — lança `ValueError` se houver ciclo.
- [ ] **T31** — Implementar `backend/tests/test_graph_builder.py`. Verificar:
  - Com lista vazia de aprovadas: grafo tem todos os nós da grade.
  - Com todas as aprovadas de Lucas: grafo tem exatamente os nós pendentes esperados (lista em `DATA.md`).
  - `nx.is_directed_acyclic_graph(G) == True` em todos os casos.
- [ ] **T32** — Implementar `backend/app/algorithm_kahn.py`:
  - `kahn_guloso(G, semestre_atual, max_disciplinas, respeitar_oferta) -> list[SemestrePlano]`.
  - Implementar tanto Caso 1 (`respeitar_oferta=True`) quanto Caso 2 (`respeitar_oferta=False`).
  - Tratar deadlock de oferta (avançar semestre sem alocar nada).
- [ ] **T33** — Implementar `backend/tests/test_algorithm_kahn.py`. Verificar:
  - Caso 2 (sem restrição): nenhuma disciplina aparece antes de seus pré-requisitos.
  - Caso 2: total de disciplinas no plano == total de disciplinas pendentes.
  - Caso 1: nenhuma disciplina alocada em semestre com tipo errado.
  - max_disciplinas é respeitado em todos os semestres.
- [ ] **T34** — Implementar `backend/app/algorithm_bfs.py`:
  - `calcular_cpm(G) -> dict[str, int]`.
  - `bfs_cpm(G, semestre_atual, max_disciplinas, respeitar_oferta) -> list[SemestrePlano]`.
- [ ] **T35** — Implementar `backend/tests/test_algorithm_bfs.py` com os mesmos critérios de T33 + verificar que `bfs_cpm` produz resultado com total_semestres ≤ resultado do `kahn_guloso` para o mesmo input (Caso 2).
- [ ] **T36** — Implementar `backend/app/utils.py`:
  - `grafo_para_nos_arestas()` — serializa o grafo para o frontend.
  - `validar_grade_json()` — validação do arquivo de dados.
- [ ] **T37** — Implementar o endpoint `POST /api/planejar` em `main.py` integrando `graph_builder`, `algorithm_kahn`, `algorithm_bfs` e `utils`. Retornar `ResultadoPlanejar` com os 4 planos.
- [ ] **T38** — Implementar o endpoint `GET /api/grade`.

**Critério de aceite T30–T38:** `pytest tests/` passa 100%. `POST /api/planejar` com o histórico de Lucas retorna 4 planos válidos.

---

## FASE 4 — Frontend: serviços e estado base

- [ ] **T40** — Implementar `frontend/src/services/api.ts` atualizando o payload de planejamento para incluir `aprovadas_manualmente`.
- [ ] **T41** — Implementar `frontend/src/hooks/usePlanner.ts` adicionando a manipulação do estado `aprovadasManualmente`.
- [ ] **T42** — Implementar `ThemeProvider.tsx` gerenciando tema claro/escuro via classe do Tailwind no HTML.
- [ ] **T43** — Implementar `Header.tsx` com o toggle de tema e o layout global no `App.tsx`.

**Critério de aceite T40–T43:** App compila sem erros TypeScript. O Dark/Light mode funciona alterando o background base da aplicação.

---

## FASE 5 — Frontend: telas Premium (Screens & Views)

- [ ] **T50** — Implementar `Screen1Upload.tsx` usando `framer-motion` para feedback visual e dropzone.
- [ ] **T51** — Implementar a base de `Screen2Preview.tsx` exibindo dados extraídos.
- [ ] **T52** — Adicionar Lógica de Conciliação em `Screen2Preview.tsx`: criar UI onde o aluno seleciona quais "não mapeadas" equivalem a OPT1, OPT2, UCE6, etc., e atualiza o estado correspondente.
- [ ] **T53** — Implementar `PlanView.tsx` aplicando utilitários `clsx` e `tailwind-merge` para estilização responsiva.
- [ ] **T54** — Implementar `GraphView.tsx` assegurando que as cores dos nós sejam visíveis e adaptáveis nos modos claro/escuro.
- [ ] **T55** — Implementar `CompareView.tsx` e lógica de realce de vantagem.
- [ ] **T56** — Implementar `Screen3Results.tsx` unindo as views em sistema de abas com transições suaves.

**Critério de aceite T50–T56:** O fluxo funciona da tela de upload até a tela de resultados. A interface de mapeamento manual reflete os dados escolhidos na requisição POST enviada ao backend.

---

## FASE 6 — Integração e Docker

- [ ] **T60** — Criar `backend/Dockerfile` conforme `BACKEND.md` seção 11.
- [ ] **T61** — Criar `frontend/Dockerfile` conforme `FRONTEND.md` seção 9.
- [ ] **T62** — Criar `docker-compose.yml` conforme `BACKEND.md` seção 12.
- [ ] **T63** — Testar o fluxo completo com `docker compose up --build`. Verificar que o frontend acessa o backend via rede interna Docker.

**Critério de aceite T60–T63:** `docker compose up --build` sobe ambos os serviços. O fluxo completo funciona em <http://localhost:5173>.

---

## FASE 7 — Testes com dados reais e ajustes

- [ ] **T70** — Executar o sistema com o histórico de Lucas (aluno no 5º período). Registrar prints do planejamento para o relatório.
- [ ] **T71** — Executar com um segundo histórico (aluno desnivelado — criar histórico fictício em `backend/samples/`). Registrar resultados.
- [ ] **T72** — Comparar os 4 planos gerados e verificar que os resultados fazem sentido academicamente.
- [ ] **T73** — Ajustar qualquer comportamento incorreto identificado nos testes T70–T72.

---

## FASE 8 — Polimento final

- [ ] **T80** — Garantir docstrings em todas as funções públicas Python.
- [ ] **T81** — Garantir comentários JSDoc em todos os componentes e funções exportadas TypeScript.
- [ ] **T82** — Revisar `README.md`: instruções claras, exemplo de uso, screenshot da interface.
- [ ] **T83** — Criar `data/README_data.md` descrevendo o formato do `grade.json` e o layout do PDF esperado.
- [ ] **T84** — Commit final com mensagem descritiva. Verificar que o repositório é público.
