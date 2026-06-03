# Planejador Acadêmico — Ciência da Computação UERN

Sistema web que gera **planejamentos acadêmicos otimizados** para alunos do curso de Ciência da Computação da UERN (Natal), aplicando **Teoria dos Grafos** sobre a matriz curricular.

O sistema recebe o PDF do histórico escolar do aluno (emitido pelo SIGAA/UERN), extrai as disciplinas aprovadas, constrói um **DAG (Grafo Dirigido Acíclico)** com as disciplinas pendentes e seus pré-requisitos, e executa algoritmos para gerar o planejamento semestral mais curto possível.

---

## Setup do Projeto

### Com Docker Compose (Recomendado)

Certifique-se de ter o Docker e o Docker Compose instalados.

```bash
# Na raiz do repositório
docker compose up --build
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend (API):** [http://localhost:8000](http://localhost:8000)
- **Docs API:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Sem Docker

#### Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em [http://localhost:5173](http://localhost:5173).

---

## Tecnologias Utilizadas

- **Backend:** Python 3.11, FastAPI, NetworkX, pdfplumber, Pydantic v2.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, React Flow, Axios.
- **Infraestrutura:** Docker, Docker Compose.

---

## Estrutura do Projeto

- `backend/`: Código fonte da API e algoritmos de grafos.
- `frontend/`: Interface do usuário e visualização de grafos.
- `data/`: Matriz curricular (grade.json).
- `docs/`: Documentação técnica e de tarefas.

---

## Licença

Este é um projeto acadêmico para a disciplina Teoria dos Grafos — UERN 2026.1.
