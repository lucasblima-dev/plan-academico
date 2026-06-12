# Planejador Acadêmico — Ciência da Computação UERN

Sistema web que gera **planejamentos acadêmicos otimizados** para alunos do curso de Ciência da Computação da UERN (Natal), aplicando **Teoria dos Grafos** sobre a matriz curricular.

O sistema recebe o PDF do histórico escolar do aluno (emitido pelo SIGAA/UERN), extrai as disciplinas aprovadas, constrói um **DAG (Grafo Dirigido Acíclico)** com as disciplinas pendentes e seus pré-requisitos, e executa algoritmos para gerar o planejamento semestral mais curto possível.

---

## Setup do Projeto

As stacks necessárias para executar o projeto são:

- [Node.js](https://nodejs.org/en/download)
- [Python 3](https://www.python.org/downloads/)
- [Docker Desktop](https://docs.docker.com/desktop/)

> A instalação do Docker Desktop é opcional, mas recomendada

## Instalação Do Projeto

Para rodar localmente, há duas maneiras. Uma com o `Docker Desktop` e a outra, criando o próprio servidor temporário com o `uvicorn` e o `vite` em terminais (`shell`) separados.

Clone o repositório e acesse o projeto:

```bash
git clone https://github.com/lucasblima-dev/plan-academico.git
cd ./plan-academico
```

### Com Docker Compose (Recomendado)

Certifique-se de ter o Docker e o Docker Compose instalados e estar na raiz do projeto (passo anterior) .

1 Inicialize o container:

```bash
# Na raiz do repositório
docker compose up --build
```

Os serviços estarão rodando nas seguintes rotas:

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend (API):** [http://localhost:8000](http://localhost:8000)
- **Docs API:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Sem Docker

1.1 Acessar o backend e inicializar o servidor do `uvicorn`:

```bash
cd ./backend

python -m venv venv

.\venv\Scripts\activate # Ambiente Windows
# Ou
source venv/bin/activate # Ambiente Linux ou Mac

# Instalar as dependências
pip install -r requirements.txt

# Rodar o servidor local
uvicorn app.main:app --reload --port 8000
```

1.2 Acessar o Frontend e inicializar o servidor com o `vite`

```bash
cd frontend

# Caso esteja em backend
cd ../frontend

# Instalar as dependências
npm install

# Startar o servidor da aplicação
npm run dev
```

O frontend estará disponível em [http://localhost:5173](http://localhost:5173).

---

## Tecnologias Utilizadas

| Camada | Tecnologias e Frameworks |
|---|---|
| **Backend** | Python 3.11, FastAPI, NetworkX, pdfplumber, Pydantic v2 |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, React Flow, Axios |
| **Infraestrutura** | Docker, Docker Compose |

---

## Estrutura do Projeto

- `backend/`: Código fonte da API e algoritmos de grafos.
- `frontend/`: Interface do usuário e visualização de grafos.
- `data/`: Matriz curricular (grade.json).
- `docs/`: Documentação técnica e de tarefas.

---

## Licença

Este é um projeto acadêmico para a disciplina Teoria dos Grafos — UERN 2026.1.
