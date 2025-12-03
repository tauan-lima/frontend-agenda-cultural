import api from './config';
import type { LoginResponseAPI, LoginCredentials, UserAPI } from '../../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponseAPI> => {
    const { data } = await api.post('/entrar', credentials);
    return data;
  },

  register: async (registerData: { name: string; email: string; senha: string }): Promise<LoginResponseAPI> => {
    const { data } = await api.post('/entrar/registrar', registerData);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<UserAPI> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

