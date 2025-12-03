import api from './config';
import type { Inscricao } from '../../types';

export const inscricoesService = {
  inscrever: async (eventId: string): Promise<Inscricao> => {
    const { data } = await api.post('/inscricoes', { eventId });
    return data;
  },

  cancelarInscricao: async (eventId: string): Promise<void> => {
    await api.delete(`/inscricoes/${eventId}`);
  },

  getInscricoes: async (eventId: string) => {
    const { data } = await api.get(`/inscricoes/${eventId}/inscritos`);
    return data;
  },

  getMinhasInscricoes: async () => {
    const { data } = await api.get('/inscricoes/meus');
    return data;
  },
};

