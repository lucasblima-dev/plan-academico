export interface DisciplinaNaoMapeada {
  codigo_sigaa: string
  nome_sigaa: string
  situacao: string
}

export interface HistoricoParseado {
  nome_aluno: string
  matricula: string
  periodo_atual: number // número real do período
  semestre_atual: number
  disciplinas_aprovadas: string[]  // IDs do grade.json
  nao_mapeadas: DisciplinaNaoMapeada[]
}

export interface DisciplinaPlano {
  id: string
  nome: string
  carga_horaria: number
  creditos: number
  semestre_oferta: number
  tipo: string
}

export interface SemestrePlano {
  numero: number
  tipo_semestre: number // 1 (ímpar) ou 2 (par)
  disciplinas: DisciplinaPlano[]
  total_disciplinas: number
  total_carga_horaria: number
}

export interface Plano {
  caso: number // 1 ou 2
  algoritmo: number // 1 ou 2
  semestres: SemestrePlano[]
  total_semestres: number
  total_disciplinas: number
  total_carga_horaria: number
}

export interface NoGrafo {
  id: string
  nome: string
  periodo_recomendado: number
  semestre_oferta: number
  aprovada: boolean
  disponivel: boolean              // sem pré-requisitos pendentes
  caminho_critico: boolean
}

export interface ArestaGrafo {
  origem: string
  destino: string
}

export interface ResultadoPlanejar {
  planos: Plano[]
  nos: NoGrafo[]
  arestas: ArestaGrafo[]
  disciplinas_pendentes: number
  disciplinas_aprovadas: number
}

export type FlowStep = 'upload' | 'preview' | 'planning'

export interface MapeamentoOptativa {
  codigo_sigaa: string
  nome_sigaa: string
  id_grade: string | null
}

export interface AppState {
  step: FlowStep
  historico: HistoricoParseado | null
  mapeamentos: MapeamentoOptativa[]
  resultado: ResultadoPlanejar | null
  maxDisciplinas: number
  loading: boolean
  error: string | null
}
