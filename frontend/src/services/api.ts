import axios from 'axios';
import type { HistoricoParseado, ResultadoPlanejar, MapeamentoOptativa } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

export const parseHistorico = async (file: File): Promise<HistoricoParseado> => {
  const formData = new FormData();
  formData.append('historico', file);

  const response = await api.post<HistoricoParseado>('/api/parse-historico', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const planejar = async (
  historico: HistoricoParseado,
  mapeamentos: MapeamentoOptativa[],
  maxDisciplinas: number
): Promise<ResultadoPlanejar> => {
  const aprovadas_manualmente = mapeamentos
    .map(m => m.id_grade)
    .filter((id): id is string => id !== null);

  const response = await api.post<ResultadoPlanejar>('/api/planejar', {
    historico,
    max_disciplinas: maxDisciplinas,
    aprovadas_manualmente
  });
  return response.data;
};

export default api;
