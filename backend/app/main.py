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

def health():
    return {"status": "ok"}

from .pdf_parser import parse_historico as pdf_parse_logic

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
    """Stub para o gerador de planejamento."""
    return {
        "planos": [],
        "nos": [],
        "arestas": [],
        "disciplinas_pendentes": 0,
        "disciplinas_aprovadas": 0
    }

@app.get("/api/grade")
async def get_grade():
    """Retorna o conteúdo do grade.json."""
    try:
        with open(GRADE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler grade: {str(e)}")
