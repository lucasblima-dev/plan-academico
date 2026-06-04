import React, { useState } from 'react'
import { clsx } from 'clsx'
import type { Plano, SemestrePlano } from '../../types'
import { Clock, BookOpen, Award, ChevronDown } from 'lucide-react'

interface PlanViewProps {
  plano: Plano
  semestreAtual: number
}

export const PlanView = React.memo(({ plano }: PlanViewProps) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white rounded-3xl px-8 py-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white/5">
        <div className="flex flex-wrap items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-accent">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Duração</p>
              <p className="text-2xl font-black">{plano.total_semestres} <span className="text-sm font-bold text-slate-500 uppercase">Semestres</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-purple-400">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Disciplinas</p>
              <p className="text-2xl font-black">{plano.total_disciplinas}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-400">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Carga Horária</p>
              <p className="text-2xl font-black">{plano.total_carga_horaria}<span className="text-sm font-bold text-slate-500 ml-1">h</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-2">
          <Award size={18} className="text-accent" />
          <span className="text-sm font-bold tracking-tight">Otimizado · {plano.total_carga_horaria / 60} CR</span>
        </div>
      </div>

      <div className="grid gap-6">
        {plano.semestres.map((semestre, index) => (
          <SemestreAccordion 
            key={semestre.numero} 
            semestre={semestre} 
            isFirst={index === 0}
            isAtual={semestre.numero === 1}
          />
        ))}
      </div>
    </div>
  )
})

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
)

interface SemestreAccordionProps {
  semestre: SemestrePlano
  isFirst: boolean
  isAtual: boolean
}

function SemestreAccordion({ semestre, isFirst, isAtual }: SemestreAccordionProps) {
  const [isOpen, setIsOpen] = useState(isFirst)

  return (
    <div className={clsx(
      "rounded-3xl overflow-hidden transition-all duration-300 border",
      isOpen ? "border-surface-subtle shadow-md bg-surface-card" : "border-transparent bg-surface-subtle/30"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between px-8 py-5 transition-colors",
          isOpen 
            ? "bg-surface-subtle/20" 
            : "hover:bg-surface-subtle/50",
          isAtual && "border-l-8 border-accent"
        )}
      >
        <div className="flex items-center gap-6">
          <div className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg",
            isOpen ? "bg-accent text-white" : "bg-surface-subtle text-slate-400"
          )}>
            {semestre.numero}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {semestre.tipo_semestre === 1 ? 'Semestre Ímpar' : 'Semestre Par'}
              </span>
              {isAtual && (
                <span className="text-[10px] font-black bg-accent/10 text-accent px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  Sugestão Atual
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Matriz {semestre.tipo_semestre === 1 ? '1, 3, 5, 7' : '2, 4, 6, 8'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">{semestre.total_disciplinas}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Matérias</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">{semestre.total_carga_horaria}h</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Esforço</span>
            </div>
          </div>
          <div className={clsx(
            "transition-transform duration-300 bg-surface-subtle p-2 rounded-xl text-slate-400",
            isOpen && "rotate-180 bg-accent/10 text-accent"
          )}>
            <ChevronDown size={20} strokeWidth={3} />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-surface-base/50 rounded-2xl overflow-hidden border border-surface-subtle divide-y divide-surface-subtle">
            {semestre.disciplinas.map((disc, idx) => (
              <div 
                key={disc.id} 
                className={clsx(
                  "px-8 py-5 flex items-center justify-between gap-4 transition-colors hover:bg-white dark:hover:bg-slate-800",
                  idx % 2 === 0 ? "" : "bg-slate-50/30 dark:bg-slate-800/20"
                )}
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-24 font-mono text-[10px] font-black text-slate-300 bg-surface-base px-2 py-1 rounded-md text-center border border-surface-subtle">
                    {disc.id}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-2">
                      {disc.nome}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                        disc.tipo === 'obrigatoria' && "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
                        disc.tipo === 'optativa' && "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
                        disc.tipo === 'uce' && "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                      )}>
                        {disc.tipo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">{disc.carga_horaria}h</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total</span>
                  </div>
                  <div className="flex flex-col items-end w-10">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">{disc.creditos}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">CR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
