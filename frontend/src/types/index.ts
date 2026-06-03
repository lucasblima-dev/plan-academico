// ── Parser output ──────────────────────────────────────────────────────────

export interface DisciplinaNaoMapeada {
  codigo_sigaa: string
  nome_sigaa: string
  situacao: string
}

export interface HistoricoParseado {
  nome_aluno: string
  matricula: string
  semestre_atual: number           // 1 (ímpar) ou 2 (par)
  disciplinas_aprovadas: string[]  // IDs do grade.json
  nao_mapeadas: DisciplinaNaoMapeada[]
}

// ── Planejamento ───────────────────────────────────────────────────────────

export interface DisciplinaPlano {
  id: string
  nome: string
  carga_horaria: number
  creditos: number
  semestre_oferta: number
  tipo: string
}

export interface SemestrePlano {
  numero: number                   // ordinal: 1, 2, 3...
  tipo_semestre: number            // 1 (ímpar) ou 2 (par)
  disciplinas: DisciplinaPlano[]
  total_disciplinas: number
  total_carga_horaria: number
}

export interface Plano {
  caso: number                     // 1 ou 2
  algoritmo: number                // 1 ou 2
  semestres: SemestrePlano[]
  total_semestres: number
  total_disciplinas: number
  total_carga_horaria: number
}

// ── Grafo ──────────────────────────────────────────────────────────────────

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
  planos: Plano[]                  // sempre 4: caso1/algo1, caso1/algo2, caso2/algo1, caso2/algo2
  nos: NoGrafo[]
  arestas: ArestaGrafo[]
  disciplinas_pendentes: number
  disciplinas_aprovadas: number
}

// ── Estado global ──────────────────────────────────────────────────────────

export type FlowStep = 'upload' | 'preview' | 'planning'

export interface MapeamentoOptativa {
  codigo_sigaa: string             // ex: "CAN0073"
  nome_sigaa: string               // ex: "Prática de Programação para Robótica I"
  id_grade: string | null          // ex: "OPT1" — null se o aluno optar por não mapear
}

export interface AppState {
  step: FlowStep
  historico: HistoricoParseado | null
  mapeamentos: MapeamentoOptativa[]  // definidos na Screen2
  resultado: ResultadoPlanejar | null
  maxDisciplinas: number
  loading: boolean
  error: string | null
}
