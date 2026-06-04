import { useState, useRef } from 'react'
import { clsx } from 'clsx'
import { UploadCloud, Lock, Box, AlertCircle, Loader2 } from 'lucide-react'

interface Screen1UploadProps {
  onUpload: (file: File) => void
  loading: boolean
  error: string | null
}

export function Screen1Upload({ onUpload, loading, error }: Screen1UploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
      <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="text-accent mb-4 flex justify-center">
          <Box size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Planejador Acadêmico
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
    </div>
  )
}
