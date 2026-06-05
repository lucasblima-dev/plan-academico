from pydantic import BaseModel, Field
from typing import Optional, List

class DisciplinaNaoMapeada(BaseModel):
    codigo_sigaa: str
    nome_sigaa: str
    situacao: str

class HistoricoParseado(BaseModel):
    nome_aluno: str
    matricula: str
    periodo_atual: int           # (número real do período)
    semestre_atual: int          # 1 (ímpar) ou 2 (par)
    disciplinas_aprovadas: List[str]  # lista de IDs do grade.json
    disciplinas_cursando: List[str] = []
    nao_mapeadas: List[DisciplinaNaoMapeada]

class PlanejamentoRequest(BaseModel):
    historico: HistoricoParseado
    max_disciplinas: int = Field(..., ge=5, le=7)
    aprovadas_manualmente: List[str] = Field(default_factory=list) 

class DisciplinaPlano(BaseModel):
    id: str
    nome: str
    carga_horaria: int
    creditos: int
    semestre_oferta: int
    tipo: str

class SemestrePlano(BaseModel):
    numero: int
    tipo_semestre: int
    disciplinas: List[DisciplinaPlano]
    total_disciplinas: int
    total_carga_horaria: int

class Plano(BaseModel):
    caso: int
    algoritmo: int
    semestres: List[SemestrePlano]
    total_semestres: int
    total_disciplinas: int
    total_carga_horaria: int

class NoGrafo(BaseModel):
    id: str
    nome: str
    periodo_recomendado: int
    semestre_oferta: int
    aprovada: bool
    cursando: bool = False
    disponivel: bool
    caminho_critico: bool
    carga_horaria: int = 0
    creditos: int = 0

class ArestaGrafo(BaseModel):
    origem: str
    destino: str

class ResultadoPlanejar(BaseModel):
    planos: List[Plano]
    nos: List[NoGrafo]
    arestas: List[ArestaGrafo]
    disciplinas_pendentes: int
    disciplinas_aprovadas: int
