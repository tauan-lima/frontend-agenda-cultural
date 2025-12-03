import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './AuthPages.css';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Obter URL de redirecionamento se existir
  const redirectTo = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // Redirecionar para a URL especificada ou para a home
      navigate(redirectTo);
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
          <h1>Bem-vindo de volta</h1>
          <p>Entre para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
            placeholder="••••••••"
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <div className="auth-form-footer">
            <Link to="/esqueci-senha" className="auth-link">
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={isLoading} className="auth-submit">
            Entrar
          </Button>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <p className="auth-footer-text">
            Não tem conta?{' '}
            <Link to="/registro" className="auth-link">
              Registre-se
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

