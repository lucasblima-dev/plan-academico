import { useState } from 'react'
import { clsx } from 'clsx'
import type { ResultadoPlanejar, Plano } from '../types'
import { PlanView } from '../components/PlanView'
import { GraphView } from '../components/GraphView'
import { CompareView } from '../components/CompareView'
import { LayoutGrid, GitGraph, Diff, Settings2, Zap } from 'lucide-react'

interface Screen3ResultsProps {
  resultado: ResultadoPlanejar
  periodoAtual: number
}

type TabType = 'plan' | 'graph' | 'compare'

export function Screen3Results({ resultado, periodoAtual }: Screen3ResultsProps) {
  const [abaAtiva, setAbaAtiva] = useState<TabType>('plan')
  const [casoAtivo, setCasoAtivo] = useState<1 | 2>(1)
  const [algoAtivo, setAlgoAtivo] = useState<1 | 2>(1)

  const planoAtivo = resultado.planos.find(
    (p: Plano) => p.caso === casoAtivo && p.algoritmo === algoAtivo
  )

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-8 border-b border-surface-subtle mb-10">
        <div className="flex p-1.5 bg-surface-subtle rounded-2xl w-fit shadow-inner">
          <button
            onClick={() => setAbaAtiva('plan')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              abaAtiva === 'plan' 
                ? "bg-surface-card text-accent shadow-sm" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <LayoutGrid size={18} />
            Planejamento
          </button>
          <button
            onClick={() => setAbaAtiva('graph')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              abaAtiva === 'graph' 
                ? "bg-surface-card text-accent shadow-sm" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <GitGraph size={18} />
            Grafo Interativo
          </button>
          <button
            onClick={() => setAbaAtiva('compare')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              abaAtiva === 'compare' 
                ? "bg-surface-card text-accent shadow-sm" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Diff size={18} />
            Comparativo
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="text-slate-400">
              <Settings2 size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cenário</span>
              <div className="flex p-1 bg-surface-subtle rounded-xl">
                {[1, 2].map(c => (
                  <button
                    key={c}
                    onClick={() => setCasoAtivo(c as 1 | 2)}
                    className={clsx(
                      "px-4 py-1 rounded-lg text-xs font-bold transition-all",
                      casoAtivo === c ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    Caso {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-slate-400">
              <Zap size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estratégia</span>
              <div className="flex p-1 bg-surface-subtle rounded-xl">
                {[1, 2].map(a => (
                  <button
                    key={a}
                    onClick={() => setAlgoAtivo(a as 1 | 2)}
                    className={clsx(
                      "px-4 py-1 rounded-lg text-xs font-bold transition-all",
                      algoAtivo === a ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    Algo {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {abaAtiva === 'plan' && planoAtivo && (
          <PlanView plano={planoAtivo} periodoAtual={periodoAtual} />
        )}

        {abaAtiva === 'graph' && (
          <GraphView nos={resultado.nos} arestas={resultado.arestas} isPlanejamento={true} />
        )}

        {abaAtiva === 'compare' && (
          <CompareView planos={resultado.planos} casoAtivo={casoAtivo} />
        )}
      </div>
    </div>
  )
}
