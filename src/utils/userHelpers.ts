import type { User } from '../types';

/**
 * Verifica se o usuário é um promoter
 */
export const isPromoter = (user: User | null): boolean => {
  if (!user) return false;
  return user.tipo === 'PROMOTER' || user.permissions?.includes('promoter') || false;
};

/**
 * Verifica se o usuário é um admin
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.tipo === 'ADMIN' || user.permissions?.includes('admin') || false;
};

/**
 * Verifica se o promoter está aprovado e pode criar eventos
 * Um promoter só pode criar eventos se:
 * - É promoter (role ou permissions)
 * - Tem approvedAt não nulo (foi aprovado por um admin)
 * OU
 * - É admin (admins podem criar eventos)
 */
export const canCreateEvents = (user: User | null): boolean => {
  if (!user) return false;

  // Admins sempre podem criar eventos
  if (isAdmin(user)) return true;

  // Verificar se é promoter e está aprovado
  const promoter = isPromoter(user);
  const approved = user.approvedAt !== null && user.approvedAt !== undefined;

  return promoter && approved;
};

/**
 * Verifica o status do promoter
 */
export const getPromoterStatus = (user: User | null): {
  isPromoter: boolean;
  isApproved: boolean;
  canCreateEvents: boolean;
  isPending: boolean;
} => {
  const promoter = isPromoter(user);
  const approved = user?.approvedAt !== null && user?.approvedAt !== undefined;
  const canCreate = canCreateEvents(user);
  const pending = promoter && !approved;

  return {
    isPromoter: promoter,
    isApproved: approved,
    canCreateEvents: canCreate,
    isPending: pending,
  };
};

