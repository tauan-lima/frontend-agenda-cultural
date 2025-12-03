import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data de forma segura, retornando uma string formatada ou uma mensagem de erro
 */
export const formatDate = (
  date: string | Date | null | undefined,
  formatString: string = "d 'de' MMMM, yyyy 'às' HH:mm"
): string => {
  if (!date) {
    return 'Data não disponível';
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error, date);
    return 'Data inválida';
  }
};

/**
 * Formata apenas a data (sem hora)
 */
export const formatDateOnly = (date: string | Date | null | undefined): string => {
  return formatDate(date, "d 'de' MMMM, yyyy");
};

/**
 * Verifica se uma data é válida
 */
export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
};

/**
 * Verifica se um evento já passou
 */
export const isEventPast = (endDate: string | Date | null | undefined): boolean => {
  if (!endDate) return false;

  try {
    const dateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
    if (isNaN(dateObj.getTime())) return false;
    return dateObj < new Date();
  } catch {
    return false;
  }
};

/**
 * Normaliza um evento da API para o formato interno
 * Lida com diferentes estruturas de resposta (startDate vs dataInicio, etc)
 */
export const normalizeEvento = (evento: any): any => {
  if (!evento) return null;

  return {
    ...evento,
    id: evento.id,
    titulo: evento.titulo || evento.title,
    descricao: evento.descricao || evento.description,
    localizacao: evento.localizacao || evento.location,
    dataInicio: evento.dataInicio || evento.startDate,
    dataFim: evento.dataFim || evento.endDate,
    imagemUrl: evento.imagemUrl || evento.imageUrl,
    requerInscricao: evento.requerInscricao !== undefined
      ? evento.requerInscricao
      : evento.requiresRegistration !== undefined
        ? evento.requiresRegistration
        : false,
    inscritos: evento.inscritos || evento._count?.registrations || 0,
    promoter: evento.promoter ? {
      id: evento.promoter.id,
      nome: evento.promoter.nome || evento.promoter.name,
      email: evento.promoter.email,
    } : undefined,
  };
};

