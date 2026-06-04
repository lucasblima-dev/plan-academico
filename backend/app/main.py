from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import logging
from pathlib import Path
from .utils import validar_grade_json
from .models import HistoricoParseado, PlanejamentoRequest, ResultadoPlanejar

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GRADE_PATH = Path(__file__).parent.parent / "data" / "grade.json"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação (Lifespan)."""
    logger.info("Iniciando validação da grade curricular...")
    try:
        if not GRADE_PATH.exists():
            logger.error(f"Arquivo de grade não encontrado em: {GRADE_PATH}")
        else:
            with open(GRADE_PATH, "r", encoding="utf-8") as f:
                grade_data = json.load(f)

            erros = validar_grade_json(grade_data)
            if erros:
                for erro in erros:
                    logger.warning(f"Inconsistência na grade: {erro}")
            else:
                logger.info("Grade curricular validada com sucesso.")
    except Exception as e:
        logger.error(f"Erro ao carregar ou validar a grade: {str(e)}")

    yield

app = FastAPI(title="Planejador Acadêmico", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

from .pdf_parser import parse_historico as pdf_parse_logic
from .graph_builder import build_graph, get_full_graph
from .algorithm_kahn import kahn_guloso
from .algorithm_bfs import bfs_cpm, calcular_cpm
from .utils import grafo_para_nos_arestas, validar_grade_json
from .models import Plano

@app.post("/api/parse-historico", response_model=HistoricoParseado)
async def parse_historico(historico: UploadFile = File(...)):
    """Realiza o parse do PDF do histórico SIGAA."""
    if not historico.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="O arquivo enviado deve ser um PDF.")
    
    try:
        pdf_bytes = await historico.read()
        resultado = pdf_parse_logic(pdf_bytes)
        return resultado
        
    except Exception as e:
        logger.error(f"Erro ao processar PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar o histórico: {str(e)}")

@app.post("/api/planejar", response_model=ResultadoPlanejar)
async def planejar(request: PlanejamentoRequest):
    """Gera o planejamento acadêmico usando dois algoritmos para dois casos."""
    try:
        # 1. Conciliar aprovadas (PDF + Manual)
        aprovadas = list(set(request.historico.disciplinas_aprovadas + request.aprovadas_manualmente))
        
        # 2. Construir DAG de pendentes
        G = build_graph(aprovadas)
        
        # 3. Executar os 4 planejamentos (2 casos x 2 algoritmos)
        # Caso 1 (respeitar_oferta=True), Caso 2 (respeitar_oferta=False)
        # Algoritmo 1 (Kahn), Algoritmo 2 (BFS)
        
        # Caso 1
        p1_kahn = kahn_guloso(G, request.historico.semestre_atual, request.max_disciplinas, True)
        p1_bfs = bfs_cpm(G, request.historico.semestre_atual, request.max_disciplinas, True)
        
        # Caso 2
        p2_kahn = kahn_guloso(G, request.historico.semestre_atual, request.max_disciplinas, False)
        p2_bfs = bfs_cpm(G, request.historico.semestre_atual, request.max_disciplinas, False)
        
        planos = [
            Plano(caso=1, algoritmo=1, semestres=p1_kahn, 
                  total_semestres=len(p1_kahn), 
                  total_disciplinas=sum(s.total_disciplinas for s in p1_kahn),
                  total_carga_horaria=sum(s.total_carga_horaria for s in p1_kahn)),
            Plano(caso=1, algoritmo=2, semestres=p1_bfs,
                  total_semestres=len(p1_bfs),
                  total_disciplinas=sum(s.total_disciplinas for s in p1_bfs),
                  total_carga_horaria=sum(s.total_carga_horaria for s in p1_bfs)),
            Plano(caso=2, algoritmo=1, semestres=p2_kahn,
                  total_semestres=len(p2_kahn),
                  total_disciplinas=sum(s.total_disciplinas for s in p2_kahn),
                  total_carga_horaria=sum(s.total_carga_horaria for s in p2_kahn)),
            Plano(caso=2, algoritmo=2, semestres=p2_bfs,
                  total_semestres=len(p2_bfs),
                  total_disciplinas=sum(s.total_disciplinas for s in p2_bfs),
                  total_carga_horaria=sum(s.total_carga_horaria for s in p2_bfs)),
        ]
        
        # 4. Preparar dados do grafo para o frontend
        G_completo = get_full_graph()
        cpm = calcular_cpm(G)
        disponiveis = [n for n in G.nodes() if G.in_degree(n) == 0]
        
        nos, arestas = grafo_para_nos_arestas(G_completo, aprovadas, cpm, disponiveis)
        
        return ResultadoPlanejar(
            planos=planos,
            nos=nos,
            arestas=arestas,
            disciplinas_pendentes=G.number_of_nodes(),
            disciplinas_aprovadas=len(aprovadas)
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Erro no planejamento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno ao gerar planejamento: {str(e)}")

@app.get("/api/grade")
async def get_grade():
    """Retorna o conteúdo do grade.json."""
    try:
        with open(GRADE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler grade: {str(e)}")
