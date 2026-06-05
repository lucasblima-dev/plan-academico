import { useMemo } from 'react'
import { clsx } from 'clsx'
import { ChevronLeft, AlertTriangle, Check, Trash2, ArrowRight, User, Calendar } from 'lucide-react'
import type { HistoricoParseado, MapeamentoOptativa } from '../../types'

interface Screen2PreviewProps {
  historico: HistoricoParseado
  mapeamentos: MapeamentoOptativa[]
  maxDisciplinas: number
  loading: boolean
  error: string | null
  onUpdateMapeamento: (codigo_sigaa: string, id_grade: string | null) => void
  onRemoveAprovada: (id: string) => void
  onMaxChange: (n: number) => void
  onConfirm: () => void
  onBack: () => void
}

const OPTATIVAS_DISPONIVEIS = [
  { id: 'OPT1', nome: 'Optativa I' },
  { id: 'OPT2', nome: 'Optativa II' },
  { id: 'OPT3', nome: 'Optativa III' },
  { id: 'OPT4', nome: 'Optativa IV' },
  { id: 'OPT5', nome: 'Optativa V' },
  { id: 'OPT6', nome: 'Optativa VI' },
  { id: 'UCE1', nome: 'UCE I' },
  { id: 'UCE2', nome: 'UCE II' },
  { id: 'UCE3', nome: 'UCE III' },
  { id: 'UCE4', nome: 'UCE IV' },
  { id: 'UCE5', nome: 'UCE V' },
  { id: 'UCE6', nome: 'UCE VI' },
]

export function Screen2Preview({
  historico,
  mapeamentos,
  maxDisciplinas,
  loading,
  error,
  onUpdateMapeamento,
  onRemoveAprovada,
  onMaxChange,
  onConfirm,
  onBack,
}: Screen2PreviewProps) {
  const isImpar = historico.semestre_atual === 1

  const idsMapeados = useMemo(() => {
    return mapeamentos.map(m => m.id_grade).filter(Boolean) as string[]
  }, [mapeamentos])

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 mb-8 transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para Upload
      </button>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
            <User size={14} />
            Perfil Acadêmico Detectado
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            Olá, {historico.nome_aluno}!
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 font-medium">
              Histórico carregado: <span className="font-mono text-slate-900 dark:text-slate-200">{historico.matricula}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-surface-card p-3 rounded-2xl border border-surface-subtle shadow-sm">
          <div className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isImpar ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
          )}>
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Período Atual</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {historico.periodo_atual}º Período ({isImpar ? 'Ímpar' : 'Par'})
            </p>
          </div>
        </div>
      </div>

      {historico.nao_mapeadas.length > 0 && (
        <div className="mb-10 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-amber-400 h-1 w-full" />
          <div className="p-6">
            <h3 className="text-amber-800 dark:text-amber-400 font-bold mb-2 flex items-center gap-2">
              <AlertTriangle size={18} />
              Disciplinas para Conciliação ({historico.nao_mapeadas.length})
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-500/80 mb-6 font-medium">
              Estas disciplinas não fazem parte da grade obrigatória. Mapeie-as como Optativas ou UCEs:
            </p>

            <div className="space-y-3">
              {historico.nao_mapeadas.map((disc) => (
                <div key={disc.codigo_sigaa} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {disc.nome_sigaa}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-600/80 uppercase">
                      {disc.codigo_sigaa} · {disc.situacao}
                    </span>
                  </div>

                  <select
                    value={mapeamentos.find(m => m.codigo_sigaa === disc.codigo_sigaa)?.id_grade || ''}
                    onChange={(e) => onUpdateMapeamento(disc.codigo_sigaa, e.target.value || null)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-accent outline-none appearance-none cursor-pointer"
                  >
                    <option value="">— Não mapear —</option>
                    {OPTATIVAS_DISPONIVEIS.map(opt => (
                      <option 
                        key={opt.id} 
                        value={opt.id}
                        disabled={idsMapeados.includes(opt.id) && mapeamentos.find(m => m.codigo_sigaa === disc.codigo_sigaa)?.id_grade !== opt.id}
                      >
                        {opt.nome}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Disciplinas Reconhecidas 
            <span className="ml-2 text-slate-400 font-medium">({historico.disciplinas_aprovadas.length})</span>
          </h3>
        </div>
        <div className="bg-surface-card border border-surface-subtle rounded-2xl overflow-hidden shadow-card">
          <div className="max-h-96 overflow-y-auto">
            {historico.disciplinas_aprovadas.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium italic">
                Nenhuma disciplina aprovada reconhecida.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-surface-subtle">
                  {historico.disciplinas_aprovadas.map((id, index) => (
                    <tr 
                      key={id} 
                      className={clsx(
                        "group transition-colors",
                        index % 2 === 0 ? "bg-white dark:bg-slate-800/20" : "bg-slate-50/50 dark:bg-slate-800/40"
                      )}
                    >
                      <td className="py-4 px-6 w-12">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {id}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => onRemoveAprovada(id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remover do planejamento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-8 border-t border-surface-subtle">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Limite por semestre
          </span>
          <div className="flex p-1.5 bg-surface-subtle rounded-2xl w-fit">
            {[5, 6, 7].map(n => (
              <button
                key={n}
                onClick={() => onMaxChange(n)}
                className={clsx(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  maxDisciplinas === n 
                    ? "bg-accent text-white shadow-md shadow-blue-500/20" 
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx(
            "px-10 py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group",
            "bg-accent hover:bg-accent-hover hover:shadow-blue-500/30",
            loading && "animate-pulse"
          )}
        >
          {loading ? 'Gerando Plano...' : (
            <>
              Gerar Planejamento Otimizado
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold text-center animate-in fade-in duration-300">
          {error}
        </div>
      )}
    </div>
  )
}
