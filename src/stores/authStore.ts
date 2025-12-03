import { create } from 'zustand';
import { authService } from '../services/api/auth';
import { promotersService } from '../services/api/promoters';
import type { User, LoginResponseAPI, UserAPI } from '../types';
import toast from 'react-hot-toast';

// Função para normalizar dados da API para formato interno
const normalizeUser = (userApi: UserAPI, permissions?: string[]): User => {
  // Mapear role da API para tipo interno
  const roleToTipo: Record<string, 'USUARIO' | 'PROMOTER' | 'ADMIN'> = {
    USER: 'USUARIO',
    PROMOTER: 'PROMOTER',
    ADMIN: 'ADMIN',
  };

  return {
    id: userApi.id,
    nome: userApi.name,
    email: userApi.email,
    tipo: roleToTipo[userApi.role] || 'USUARIO',
    promoterStatus: userApi.promoterStatus,
    avatar: userApi.avatar,
    createdAt: userApi.createdAt || new Date().toISOString(),
    permissions: permissions || [],
    approvedAt: userApi.approvedAt,
  };
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    senha: string;
  }) => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  solicitarPromoter: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, senha: password });
      localStorage.setItem('token', response.token);

      // Normalizar dados da API para formato interno
      const normalizedUser = normalizeUser(response.user, response.permissions);

      set({ user: normalizedUser, isAuthenticated: true });
      toast.success(`Bem-vindo, ${normalizedUser.nome}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
      throw error;
    }
  },

  register: async (data) => {
    try {
      const response = await authService.register(data);
      localStorage.setItem('token', response.token);

      // Normalizar dados da API para formato interno
      const normalizedUser = normalizeUser(response.user, response.permissions);

      set({ user: normalizedUser, isAuthenticated: true });
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
      toast.success('Logout realizado com sucesso');
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const userApi = await authService.getCurrentUser();
      // Normalizar dados da API para formato interno
      // Se getCurrentUser retornar permissions, usar; senão tentar inferir do role
      const permissions = userApi.role ? [userApi.role.toLowerCase()] : [];
      const normalizedUser = normalizeUser(userApi, permissions);
      set({ user: normalizedUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  solicitarPromoter: async () => {
    try {
      const response = await promotersService.solicitarPromoter();
      // Normalizar dados da API para formato interno
      const permissions = response.user.role ? [response.user.role.toLowerCase()] : [];
      const normalizedUser = normalizeUser(response.user, permissions);
      set({ user: normalizedUser });
      toast.success(response.message || 'Solicitação enviada com sucesso! Aguarde aprovação.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao solicitar ser promoter');
      throw error;
    }
  },
}));

