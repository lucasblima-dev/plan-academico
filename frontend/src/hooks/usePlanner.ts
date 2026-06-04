import { useState, useCallback } from 'react'
import { parseHistorico, planejar } from '../services/api'
import type { AppState, HistoricoParseado, MapeamentoOptativa } from '../types'

export function usePlanner() {
  const [state, setState] = useState<AppState>({
    step: 'upload',
    historico: null,
    mapeamentos: [],
    resultado: null,
    maxDisciplinas: 6,
    loading: false,
    error: null,
  })

  const handleUpload = useCallback(async (file: File) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const historico = await parseHistorico(file)
      const mapeamentos: MapeamentoOptativa[] = historico.nao_mapeadas.map(d => ({
        codigo_sigaa: d.codigo_sigaa,
        nome_sigaa: d.nome_sigaa,
        id_grade: null,
      }))
      setState(s => ({ ...s, historico, mapeamentos, step: 'preview', loading: false }))
    } catch (err) {
      console.error(err)
      setState(s => ({
        ...s,
        loading: false,
        error: 'Erro ao processar o PDF. Verifique se é um histórico válido do SIGAA.'
      }))
    }
  }, [])

  const handleConfirm = useCallback(async (
    historico: HistoricoParseado,
    mapeamentos: MapeamentoOptativa[],
  ) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const resultado = await planejar(historico, mapeamentos, state.maxDisciplinas)
      setState(s => ({ ...s, resultado, step: 'planning', loading: false }))
    } catch (err) {
      console.error(err)
      setState(s => ({
        ...s,
        loading: false,
        error: 'Erro ao gerar planejamento. Tente novamente.'
      }))
    }
  }, [state.maxDisciplinas])

  const setMaxDisciplinas = useCallback((n: number) => {
    setState(s => ({ ...s, maxDisciplinas: n }))
  }, [])

  const updateMapeamento = useCallback((codigo_sigaa: string, id_grade: string | null) => {
    setState(s => ({
      ...s,
      mapeamentos: s.mapeamentos.map(m =>
        m.codigo_sigaa === codigo_sigaa ? { ...m, id_grade } : m
      ),
    }))
  }, [])

  const removeAprovada = useCallback((id: string) => {
    setState(s => ({
      ...s,
      historico: s.historico ? {
        ...s.historico,
        disciplinas_aprovadas: s.historico.disciplinas_aprovadas.filter(a => a !== id)
      } : null
    }))
  }, [])

  const handleReset = useCallback(() => {
    setState({
      step: 'upload',
      historico: null,
      mapeamentos: [],
      resultado: null,
      maxDisciplinas: 6,
      loading: false,
      error: null
    })
  }, [])

  return { state, handleUpload, handleConfirm, handleReset, setMaxDisciplinas, updateMapeamento, removeAprovada }
}
