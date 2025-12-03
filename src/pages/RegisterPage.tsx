import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './AuthPages.css';

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(20, 'Senha deve ter no máximo 20 caracteres'),
    confirmSenha: z.string(),
    aceitoTermos: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
  })
  .refine((data) => data.senha === data.confirmSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmSenha'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      aceitoTermos: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        senha: data.senha,
      });
      navigate('/');
    } catch (error) {
      // Erro já tratado no store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <Calendar size={32} className="auth-logo" />
          <h1>Criar conta</h1>
          <p>Junte-se à nossa comunidade</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome completo"
            error={errors.name?.message}
            required
            minLength={3}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.senha?.message}
            required
            minLength={6}
            maxLength={20}
            {...register('senha')}
          />

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Digite a senha novamente"
            error={errors.confirmSenha?.message}
            required
            {...register('confirmSenha')}
          />

          <div className="auth-checkbox-group">
            <input
              type="checkbox"
              id="aceitoTermos"
              {...register('aceitoTermos')}
              className="auth-checkbox"
            />
            <label htmlFor="aceitoTermos" className="auth-checkbox-label">
              Aceito os{' '}
              <Link to="/termos" className="auth-link">
                termos e condições
              </Link>
            </label>
          </div>
          {errors.aceitoTermos && (
            <span className="auth-error-text">{errors.aceitoTermos.message}</span>
          )}

          <Button type="submit" variant="primary" size="lg" loading={isLoading} className="auth-submit">
            Criar conta
          </Button>

          <p className="auth-footer-text">
            Já tem conta?{' '}
            <Link to="/login" className="auth-link">
              Faça login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

