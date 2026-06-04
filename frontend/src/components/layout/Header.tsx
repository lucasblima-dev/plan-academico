import { useTheme } from './ThemeProvider'
import { Moon, Sun, RefreshCw, Box } from 'lucide-react'

interface HeaderProps {
  showReset: boolean
  onReset: () => void
}

export function Header({ showReset, onReset }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 bg-slate-900 dark:bg-slate-950 border-b border-white/10 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="text-white">
          <Box size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
            Planejador Acadêmico
          </h1>
          <p className="text-slate-400 text-xs font-medium">
            Teoria dos Grafos · UERN 2026.1
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {showReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Novo planejamento</span>
          </button>
        )}

        <button
          onClick={toggle}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white"
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}
