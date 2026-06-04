# TASKS.md — Lista de Tarefas do Projeto

## FASE 1: Setup e Infraestrutura (Concluída)
- [x] Estrutura de pastas (backend/frontend/docs/data)
- [x] Configuração Docker e Docker Compose
- [x] Definição de Schemas Pydantic (`models.py`)
- [x] Criação do `grade.json` com a matriz curricular oficial

## FASE 2: Parser de Histórico (Concluída)
- [x] Implementação do `pdf_parser.py` com `pdfplumber`
- [x] Mapeamento `SIGAA_PARA_ID` no backend
- [x] Endpoint `POST /api/parse-historico`
- [x] Testes unitários do parser com o histórico de Lucas

## FASE 3: Lógica e Algoritmos (Concluída)
- [x] Implementação do `graph_builder.py` (Construção do DAG)
- [x] Implementação do `algorithm_kahn.py` (Kahn + Heurística Gulosa)
- [x] Implementação do `algorithm_bfs.py` (BFS + Caminho Crítico CPM)
- [x] Helper de serialização de grafo em `utils.py`
- [x] Integração do endpoint `POST /api/planejar`
- [x] Testes unitários de grafos e algoritmos
- [x] Teste de integração final da API de planejamento

## FASE 4: Frontend e Visualização (Pendente)
- [ ] Setup do Tailwind CSS v4 e Design System
- [ ] Implementação do `usePlanner` hook (Estado Global)
- [ ] Tela 1: Upload de PDF com Drag-and-Drop
- [ ] Tela 2: Preview e Match de Optativas/UCEs
- [ ] Tela 3: Exibição de Planos (Accordions)
- [ ] View de Grafo Interativo com React Flow
- [ ] View Comparativa de Algoritmos
- [ ] Toggle Dark/Light Mode

## FASE 5: Polimento e Entrega (Pendente)
- [ ] Refinamento de UX/UI (Animações e Tooltips)
- [ ] Validação final com múltiplos históricos
- [ ] Documentação técnica e README final
- [ ] Preparação para o relatório final
