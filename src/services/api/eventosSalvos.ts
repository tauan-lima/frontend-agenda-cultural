import api from './config';
import type { EventoSalvo } from '../../types';

export const eventosSalvosService = {
  getEventosSalvos: async () => {
    const { data } = await api.get('/eventos-salvos');
    // Se a resposta for um objeto com propriedade 'data' ou 'eventos', retorna o array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data.data || data.eventos || data.items || [];
    }
    // Se já for um array, retorna diretamente
    return Array.isArray(data) ? data : [];
  },

  salvarEvento: async (eventId: string): Promise<EventoSalvo> => {
    const { data } = await api.post('/eventos-salvos', { eventId });
    return data;
  },

  removerEventoSalvo: async (eventId: string): Promise<void> => {
    await api.delete(`/eventos-salvos/${eventId}`);
  },
};

