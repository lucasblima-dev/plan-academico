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
    nao_mapeadas: List[DisciplinaNaoMapeada]

class PlanejamentoRequest(BaseModel):
    historico: HistoricoParseado
    max_disciplinas: int = Field(..., ge=5, le=7)
    aprovadas_manualmente: List[str] = Field(default_factory=list) 
    # Recebe os IDs (ex: "OPT1", "UCE6") que o aluno conciliou na Tela 2

class DisciplinaPlano(BaseModel):
    id: str
    nome: str
    carga_horaria: int
    creditos: int
    semestre_oferta: int
    tipo: str

class SemestrePlano(BaseModel):
    numero: int                  # 1, 2, 3... (ordinal do planejamento)
    tipo_semestre: int           # 1 (ímpar) ou 2 (par)
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
    disponivel: bool             # sem pré-requisitos pendentes
    caminho_critico: bool        # está no caminho crítico do DAG

class ArestaGrafo(BaseModel):
    origem: str                  # id da disciplina pré-requisito
    destino: str                 # id da disciplina dependente

class ResultadoPlanejar(BaseModel):
    planos: List[Plano]          # sempre 4 planos: 2 casos x 2 algoritmos
    nos: List[NoGrafo]           # todos os nós do grafo (aprovados + pendentes)
    arestas: List[ArestaGrafo]
    disciplinas_pendentes: int
    disciplinas_aprovadas: int
