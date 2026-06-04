import { useState, useRef } from 'react'
import { clsx } from 'clsx'
import { UploadCloud, Lock, Zap, AlertCircle, Loader2, BookOpen, X } from 'lucide-react'
import { getGrade } from '../../services/api'
import { GraphView } from '../views/GraphView'
import type { NoGrafo, ArestaGrafo, DisciplinaGrade } from '../../types'

interface Screen1UploadProps {
  onUpload: (file: File) => void
  loading: boolean
  error: string | null
}

export function Screen1Upload({ onUpload, loading, error }: Screen1UploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [gradeData, setGradeData] = useState<{ nos: NoGrafo[], arestas: ArestaGrafo[] } | null>(null)
  const [gradeLoading, setGradeLoading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      onUpload(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      onUpload(file)
    }
  }

  const handleVerGrade = async () => {
    setGradeLoading(true)
    try {
      const data = await getGrade()
      const nos: NoGrafo[] = data.disciplinas.map((d: DisciplinaGrade) => ({
        id: d.id,
        nome: d.nome,
        periodo_recomendado: d.periodo_recomendado,
        semestre_oferta: d.semestre_oferta,
        aprovada: false,
        cursando: false,
        disponivel: true,
        caminho_critico: false
      }))

      const arestas: ArestaGrafo[] = []
      data.disciplinas.forEach((d: DisciplinaGrade) => {
        d.pre_requisitos.forEach((pre: string) => {
          arestas.push({ origem: pre, destino: d.id })
        })
      })

      setGradeData({ nos, arestas })
      setShowGradeModal(true)
    } catch (err) {
      console.error('Erro ao carregar grade:', err)
    } finally {
      setGradeLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
      <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="text-accent mb-4 flex justify-center">
          <Zap size={48} className="text-accent fill-accent/10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
          PLAN<span className="text-accent">ACADÊMICO</span>
        </h2>
        <p className="text-slate-500 font-medium mt-1">
          Gere seu planejamento semestral ideal
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={clsx(
          'w-full max-w-2xl aspect-video rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 border-dashed',
          isDragOver 
            ? 'border-accent bg-brand-light scale-[1.01]' 
            : 'border-surface-subtle bg-surface-card hover:border-accent hover:bg-brand-light',
          error && 'border-red-500 bg-red-50',
          loading && 'cursor-wait opacity-80'
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf"
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center animate-in fade-in duration-300">
            <Loader2 size={48} className="text-accent animate-spin mb-4" />
            <p className="text-slate-700 dark:text-slate-200 font-bold text-lg">
              Processando histórico...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-8">
            <div className="w-20 h-20 bg-brand-light rounded-2xl flex items-center justify-center text-accent mb-6 shadow-sm">
              <UploadCloud size={32} />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Arraste o PDF aqui
            </p>
            <p className="text-slate-500 font-medium">
              ou clique para selecionar o arquivo
            </p>
            <div className="mt-10 px-6 py-2 bg-surface-base rounded-full text-xs font-mono font-bold text-slate-400 border border-surface-subtle">
              HISTÓRICO ESCOLAR · SIGAA/UERN
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleVerGrade}
          disabled={gradeLoading}
          className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 border-2 border-surface-subtle hover:border-accent rounded-2xl font-bold text-slate-600 dark:text-slate-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {gradeLoading ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
          Ver Grade Curricular Completa
        </button>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm max-w-2xl w-full flex items-center gap-3 animate-in shake duration-500">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="mt-16 flex items-center gap-2 text-slate-400">
        <Lock size={14} />
        <span className="text-xs font-bold uppercase tracking-widest">Privacidade Garantida · Processado localmente</span>
      </div>

      {showGradeModal && gradeData && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full h-full max-w-7xl bg-surface-base rounded-[40px] overflow-hidden flex flex-col relative shadow-2xl">
            <div className="flex items-center justify-between px-10 py-6 border-b border-surface-subtle bg-surface-card">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Grade Curricular Completa</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Matriz Curricular 2023.1 · UERN</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGradeModal(false)}
                className="w-12 h-12 flex items-center justify-center bg-surface-subtle hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950">
              <GraphView nos={gradeData.nos} arestas={gradeData.arestas} exibirLegenda={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
