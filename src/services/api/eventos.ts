import api from './config';
import type { Evento, EventoFormData, CreateEventoAPI, EventoAPI, PaginatedResponse } from '../../types';

// Função auxiliar para converter EventoFormData para CreateEventoAPI
const convertFormDataToAPI = (formData: EventoFormData): CreateEventoAPI => {
  return {
    title: formData.titulo,
    description: formData.descricao,
    location: formData.localizacao,
    startDate: new Date(formData.dataInicio).toISOString(),
    endDate: new Date(formData.dataFim).toISOString(),
    imageUrl: formData.imagemUrl || null,
    requiresRegistration: formData.requerInscricao,
  };
};

// Função auxiliar para converter EventoAPI para Evento (formato interno)
const convertAPIToEvento = (apiEvento: EventoAPI): Evento => {
  // Validar que startDate existe e é válido
  if (!apiEvento.startDate) {
    console.warn('Evento sem startDate:', apiEvento);
  }

  return {
    id: apiEvento.id,
    titulo: apiEvento.title,
    descricao: apiEvento.description,
    localizacao: apiEvento.location,
    dataInicio: apiEvento.startDate || apiEvento.createdAt || new Date().toISOString(),
    dataFim: apiEvento.endDate || apiEvento.createdAt || new Date().toISOString(),
    imagemUrl: apiEvento.imageUrl || undefined,
    requerInscricao: apiEvento.requiresRegistration,
    status: apiEvento.status,
    promoterId: apiEvento.promoterId,
    rejectionReason: apiEvento.rejectionReason,
    promoter: apiEvento.promoter ? {
      id: apiEvento.promoter.id,
      nome: apiEvento.promoter.name,
      email: apiEvento.promoter.email,
    } : undefined,
    inscritos: apiEvento._count?.registrations,
    createdAt: apiEvento.createdAt,
  };
};

export const eventosService = {
  getEventos: async (params?: {
    search?: string;
    categoria?: string;
    promoterId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get('/eventos', { params });

    // Se a resposta tiver paginação (nova estrutura)
    if (data && typeof data === 'object' && data.events && Array.isArray(data.events)) {
      return {
        events: data.events.map((evento: EventoAPI) => convertAPIToEvento(evento)),
        pagination: data.pagination || {
          page: 1,
          limit: 10,
          total: data.events.length,
          totalPages: 1,
        },
      };
    }

    // Se a resposta for um objeto com propriedade 'data' ou 'eventos', retorna o array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const eventosArray = data.data || data.eventos || data.items || [];
      return eventosArray.map((evento: EventoAPI) => convertAPIToEvento(evento));
    }
    // Se já for um array, retorna diretamente convertido
    return Array.isArray(data) ? data.map((evento: EventoAPI) => convertAPIToEvento(evento)) : [];
  },

  getEvento: async (id: string): Promise<Evento> => {
    const { data } = await api.get(`/eventos/${id}`);
    return convertAPIToEvento(data);
  },

  createEvento: async (eventoData: EventoFormData): Promise<Evento> => {
    const apiData = convertFormDataToAPI(eventoData);
    const { data } = await api.post('/eventos', apiData);
    return convertAPIToEvento(data);
  },

  updateEvento: async (id: string, eventoData: Partial<EventoFormData>): Promise<Evento> => {
    // Converter apenas os campos fornecidos
    const apiData: Partial<CreateEventoAPI> = {};
    if (eventoData.titulo) apiData.title = eventoData.titulo;
    if (eventoData.descricao) apiData.description = eventoData.descricao;
    if (eventoData.localizacao) apiData.location = eventoData.localizacao;
    if (eventoData.dataInicio) apiData.startDate = new Date(eventoData.dataInicio).toISOString();
    if (eventoData.dataFim) apiData.endDate = new Date(eventoData.dataFim).toISOString();
    if (eventoData.imagemUrl !== undefined) apiData.imageUrl = eventoData.imagemUrl || null;
    if (eventoData.requerInscricao !== undefined) apiData.requiresRegistration = eventoData.requerInscricao;

    const { data } = await api.put(`/eventos/${id}`, apiData);
    return convertAPIToEvento(data);
  },

  deleteEvento: async (id: string): Promise<void> => {
    await api.delete(`/eventos/${id}`);
  },

  cancelarEvento: async (id: string): Promise<Evento> => {
    const { data } = await api.put(`/eventos/${id}/cancelar`);
    return convertAPIToEvento(data);
  },

  aprovarEvento: async (id: string): Promise<Evento> => {
    const { data } = await api.put(`/eventos/${id}/aprovar`);
    return convertAPIToEvento(data);
  },

  rejeitarEvento: async (id: string, rejectionReason: string): Promise<Evento> => {
    const { data } = await api.put(`/eventos/${id}/rejeitar`, { rejectionReason });
    return convertAPIToEvento(data);
  },

  revogarEvento: async (id: string): Promise<Evento> => {
    const { data } = await api.put(`/eventos/${id}/revogar`);
    return convertAPIToEvento(data);
  },

  // Endpoint específico para promoters listarem seus eventos
  getMeusEventos: async (params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Evento>> => {
    const { data } = await api.get('/eventos/meus', { params });

    // Converter eventos da API para formato interno
    const eventos = Array.isArray(data.events)
      ? data.events.map((evento: EventoAPI) => convertAPIToEvento(evento))
      : [];

    return {
      events: eventos,
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        total: eventos.length,
        totalPages: 1,
      },
    };
  },

  // Endpoint específico para admins listarem eventos pendentes
  getEventosPendentes: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Evento>> => {
    const { data } = await api.get('/eventos/pendentes', { params });

    // Converter eventos da API para formato interno
    const eventos = Array.isArray(data.events)
      ? data.events.map((evento: EventoAPI) => convertAPIToEvento(evento))
      : [];

    return {
      events: eventos,
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        total: eventos.length,
        totalPages: 1,
      },
    };
  },
};

