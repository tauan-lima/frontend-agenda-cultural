import api from './config';
import type { User, UserAPI } from '../../types';

export interface SolicitarPromoterResponse {
  message: string;
  user: UserAPI;
}

export const promotersService = {
  getPromotersPendentes: async () => {
    const { data } = await api.get('/promoters/pendentes');
    // Se a resposta for um objeto com propriedade 'data' ou 'promoters', retorna o array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data.data || data.promoters || data.items || [];
    }
    // Se já for um array, retorna diretamente
    return Array.isArray(data) ? data : [];
  },

  solicitarPromoter: async (): Promise<SolicitarPromoterResponse> => {
    const { data } = await api.post('/promoters/solicitar');
    return data;
  },

  aprovarPromoter: async (id: string): Promise<User> => {
    const { data } = await api.post(`/promoters/${id}/aprovar`);
    return data;
  },

  rejeitarPromoter: async (id: string): Promise<User> => {
    const { data } = await api.post(`/promoters/${id}/rejeitar`);
    return data;
  },
};

