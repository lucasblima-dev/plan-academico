import { usePlanner } from './hooks/usePlanner'
import { Header } from './components/layout/Header'
import { Screen1Upload } from './components/screens/Screen1Upload'
import { Screen2Preview } from './components/screens/Screen2Preview'
import { Screen3Results } from './components/screens/Screen3Results'

export default function App() {
  const planner = usePlanner()
  const { state } = planner

  return (
    <div className="min-h-screen bg-surface-base transition-colors duration-200 flex flex-col">
      <Header
        showReset={state.step !== 'upload'}
        onReset={planner.handleReset}
      />

      <main className="flex-1 mt-16"> {/* compensa o header fixo de 64px */}
        {state.step === 'upload' && (
          <Screen1Upload
            onUpload={planner.handleUpload}
            loading={state.loading}
            error={state.error}
          />
        )}

        {state.step === 'preview' && state.historico && (
          <Screen2Preview
            historico={state.historico}
            mapeamentos={state.mapeamentos}
            maxDisciplinas={state.maxDisciplinas}
            loading={state.loading}
            error={state.error}
            onUpdateMapeamento={planner.updateMapeamento}
            onRemoveAprovada={planner.removeAprovada}
            onMaxChange={planner.setMaxDisciplinas}
            onConfirm={() => planner.handleConfirm(state.historico!, state.mapeamentos)}
            onBack={planner.handleReset}
          />
        )}

        {state.step === 'planning' && state.resultado && (
          <Screen3Results 
            resultado={state.resultado} 
            periodoAtual={state.historico!.periodo_atual} 
          />
        )}
      </main>
    </div>
  )
}
