from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
from pathlib import Path
from .utils import validar_grade_json
from .models import HistoricoParseado, PlanejamentoRequest, ResultadoPlanejar

# Configuração de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Planejador Acadêmico", version="1.0.0")

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GRADE_PATH = Path(__file__).parent.parent / "data" / "grade.json"

@app.on_event("startup")
async def startup_event():
    """Executa validações iniciais no startup da API."""
    logger.info("Iniciando validação da grade curricular...")
    try:
        if not GRADE_PATH.exists():
            logger.error(f"Arquivo de grade não encontrado em: {GRADE_PATH}")
            return

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

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/parse-historico", response_model=HistoricoParseado)
async def parse_historico(historico: UploadFile = File(...)):
    """Stub para o parser de PDF."""
    if not historico.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="O arquivo enviado deve ser um PDF.")
    
    return {
        "nome_aluno": "Not Implemented",
        "matricula": "000000000",
        "semestre_atual": 1,
        "disciplinas_aprovadas": [],
        "nao_mapeadas": []
    }

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
