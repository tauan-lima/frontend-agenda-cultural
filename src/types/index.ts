// Interface da API (resposta do backend)
export interface UserAPI {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'PROMOTER' | 'ADMIN';
  promoterStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  avatar?: string;
  createdAt?: string;
  approvedAt?: string | null;
}

// Interface interna do frontend (normalizada)
export interface User {
  id: string;
  nome: string; // mapeado de name
  email: string;
  tipo: 'USUARIO' | 'PROMOTER' | 'ADMIN'; // mapeado de role
  promoterStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  avatar?: string;
  createdAt: string;
  permissions?: string[]; // Permissões do usuário (ex: ['promoter'], ['admin'])
  approvedAt?: string | null; // Data de aprovação do promoter
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  localizacao: string;
  imagemUrl?: string;
  requerInscricao: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  promoterId: string;
  promoter?: {
    id: string;
    nome: string;
    email: string;
  };
  inscritos?: number;
  inscrito?: boolean;
  favorito?: boolean;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface Inscricao {
  id: string;
  eventoId: string;
  usuarioId: string;
  createdAt: string;
}

export interface EventoSalvo {
  id: string;
  eventoId: string;
  usuarioId: string;
  evento?: Evento;
  createdAt: string;
}

// Resposta da API de login
export interface LoginResponseAPI {
  token: string;
  user: UserAPI;
  permissions: string[]; // Array de permissões no nível raiz
}

// Resposta normalizada para uso interno
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

// Interface para API de registro
export interface RegisterDataAPI {
  name: string;
  email: string;
  senha: string;
}

// Interface para formulário (frontend)
export interface RegisterData {
  name: string;
  email: string;
  senha: string;
  confirmSenha: string;
  aceitoTermos: boolean;
}

// Interface para formulário (frontend)
export interface EventoFormData {
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  localizacao: string;
  imagemUrl?: string;
  requerInscricao: boolean;
}

// Interface para API (backend)
export interface CreateEventoAPI {
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  imageUrl?: string | null;
  requiresRegistration: boolean;
}

// Interface de resposta da API
export interface EventoAPI {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
  requiresRegistration: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  promoterId: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  promoter?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    registrations: number;
  };
}

// Interface para resposta paginada
export interface PaginatedResponse<T> {
  events: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

