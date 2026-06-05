import { useMemo } from 'react'
import { clsx } from 'clsx'
import type { Plano, SemestrePlano, DisciplinaPlano } from '../types'
import { CheckCircle2, Info, ArrowRightLeft, TrendingUp } from 'lucide-react'

interface CompareViewProps {
  planos: Plano[]
  casoAtivo: 1 | 2
}

export function CompareView({ planos, casoAtivo }: CompareViewProps) {
  const analysisText = useMemo(() => {
    const p1 = planos.find(p => p.caso === 1 && p.algoritmo === 1)
    const p2 = planos.find(p => p.caso === 2 && p.algoritmo === 1)
    
    if (!p1 || !p2) return ''

    const diff = p1.total_semestres - p2.total_semestres
    
    if (diff > 0) {
      return `A restrição de oferta semestral (Caso 1) aumenta a duração em ${diff} semestre(s) comparado ao Caso 2.`
    } else {
      return `Neste perfil, a restrição de oferta não impacta a duração total do curso.`
    }
  }, [planos])

  const minSemestres = useMemo(() => Math.min(...planos.map(p => p.total_semestres)), [planos])

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white rounded-3xl px-10 py-8 shadow-2xl border-l-8 border-accent flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
          <TrendingUp size={32} />
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Info size={14} />
            Análise de Viabilidade
          </h3>
          <p className="text-xl font-bold leading-tight tracking-tight">
            {analysisText}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-8">
          <ArrowRightLeft size={20} className="text-accent" />
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            Benchmarks de Desempenho
          </h3>
        </div>
        <div className="overflow-x-auto bg-surface-card border border-surface-subtle rounded-3xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-subtle bg-surface-subtle/20">
                <th className="py-6 px-8"></th>
                {planos.map((p, i) => (
                  <th key={i} className="py-6 px-6 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cenário</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">Caso {p.caso} · A{p.algoritmo}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-subtle">
              <tr>
                <td className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest bg-surface-subtle/10">Semestres</td>
                {planos.map((p, i) => (
                  <td key={i} className={clsx(
                    "py-6 px-6 text-center font-black text-lg",
                    p.total_semestres === minSemestres ? "text-green-500 bg-green-50/30 dark:bg-green-900/10" : "text-slate-800 dark:text-slate-100"
                  )}>
                    {p.total_semestres}
                    {p.total_semestres === minSemestres && <CheckCircle2 size={16} className="inline ml-2" />}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest bg-surface-subtle/10">Disciplinas</td>
                {planos.map((p, i) => (
                  <td key={i} className="py-6 px-6 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                    {p.total_disciplinas}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest bg-surface-subtle/10">Carga Horária</td>
                {planos.map((p, i) => (
                  <td key={i} className="py-6 px-6 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                    {p.total_carga_horaria}h
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-8">
          <CheckCircle2 size={20} className="text-accent" />
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            Divergência Algorítmica 
            <span className="ml-3 text-slate-400 font-bold lowercase tracking-normal">· Caso {casoAtivo}</span>
          </h3>
        </div>
        
        <div className="border border-surface-subtle rounded-3xl overflow-hidden shadow-sm bg-surface-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/30 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-surface-subtle">
                <th className="py-5 px-8 w-24">Período</th>
                <th className="py-5 px-8">Algoritmo 1 (Kahn + Out-Degree)</th>
                <th className="py-5 px-8">Algoritmo 2 (BFS + CPM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-subtle">
              {Array.from({ length: Math.max(...planos.filter(p => p.caso === casoAtivo).map(p => p.total_semestres)) }).map((_, idx) => {
                const semNum = idx + 1
                const p1 = planos.find(p => p.caso === casoAtivo && p.algoritmo === 1)
                const p2 = planos.find(p => p.caso === casoAtivo && p.algoritmo === 2)
                
                const s1 = p1?.semestres.find((s: SemestrePlano) => s.numero === semNum)
                const s2 = p2?.semestres.find((s: SemestrePlano) => s.numero === semNum)

                const names1 = s1?.disciplinas.map((d: DisciplinaPlano) => d.nome).join(', ') || '—'
                const names2 = s2?.disciplinas.map((d: DisciplinaPlano) => d.nome).join(', ') || '—'
                const divergem = names1 !== names2 && names1 !== '—' && names2 !== '—'

                return (
                  <tr key={idx} className={clsx(
                    "transition-colors",
                    divergem ? "bg-accent/5" : "hover:bg-surface-base/50"
                  )}>
                    <td className="py-5 px-8 font-black text-slate-400 italic text-sm">#{semNum}</td>
                    <td className="py-5 px-8 text-[13px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      {names1}
                    </td>
                    <td className="py-5 px-8 text-[13px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      {names2}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
