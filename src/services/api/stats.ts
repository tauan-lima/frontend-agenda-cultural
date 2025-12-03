import api from './config';

export interface StatsResponse {
  totalInscritos: number;
  totalEventos: number;
  eventosPorStatus: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    CANCELLED: number;
  };
  totalUsuariosAtivos: number;
  totalUsuarios: number;
  totalPromoters: number;
  promotersPendentes: number;
  promotersAprovados: number;
  locaisMaisPopulares: Array<{
    localizacao: string;
    totalEventos: number;
    totalInscritos: number;
  }>;
  taxaAceitacao: {
    eventos: {
      aprovados: number;
      rejeitados: number;
      taxaAprovacao: number; // porcentagem
    };
    promoters: {
      aprovados: number;
      rejeitados: number;
      taxaAprovacao: number; // porcentagem
    };
  };
  eventosPorMes: Array<{
    mes: string;
    total: number;
    aprovados: number;
    pendentes: number;
  }>;
  inscricoesPorMes: Array<{
    mes: string;
    total: number;
  }>;
}

export const statsService = {
  /**
   * Busca todas as estatísticas do sistema
   * Requer autenticação de ADMIN
   */
  getStats: async (): Promise<StatsResponse> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  /**
   * Busca estatísticas de inscrições
   */
  getInscricoesStats: async () => {
    const { data } = await api.get('/admin/stats/inscricoes');
    return data;
  },

  /**
   * Busca estatísticas de eventos
   */
  getEventosStats: async () => {
    const { data } = await api.get('/admin/stats/eventos');
    return data;
  },

  /**
   * Busca estatísticas de usuários
   */
  getUsuariosStats: async () => {
    const { data } = await api.get('/admin/stats/usuarios');
    return data;
  },
};

