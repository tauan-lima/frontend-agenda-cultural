import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { getPromoterStatus } from '../utils/userHelpers';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './PerfilPage.css';

const perfilSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

export const PerfilPage = () => {
  const { user, solicitarPromoter } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: user?.nome || '',
    },
  });

  const onSubmit = (data: PerfilFormData) => {
    // TODO: Implementar atualização de perfil
    console.log(data);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'USUARIO':
        return 'Usuário';
      case 'PROMOTER':
        return 'Promoter';
      case 'ADMIN':
        return 'Administrador';
      default:
        return tipo;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprovado';
      case 'PENDING':
        return 'Pendente';
      case 'REJECTED':
        return 'Rejeitado';
      default:
        return '';
    }
  };

  // Verificar status do promoter usando helper
  const promoterStatusInfo = getPromoterStatus(user);

  const getPromoterStatusText = () => {
    if (!user) return null;

    if (user.tipo === 'ADMIN') {
      return { text: 'Você é administrador', canRequest: false, isApproved: true };
    }

    if (promoterStatusInfo.isPromoter) {
      if (promoterStatusInfo.isApproved) {
        return { text: 'Você é um promoter aprovado!', canRequest: false, isApproved: true };
      } else {
        return { text: 'Sua solicitação está pendente de aprovação', canRequest: false, isApproved: false };
      }
    }

    return { text: 'Você é um usuário comum', canRequest: true, isApproved: false };
  };

  const promoterStatus = getPromoterStatusText();

  return (
    <div className="perfil-page">
      <div className="container">
        <Card className="perfil-card">
          <div className="perfil-header">
            <div className="perfil-avatar-large">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.nome} />
              ) : (
                <span>{getInitials(user?.nome || '')}</span>
              )}
            </div>
            <div className="perfil-info">
              <h1>{user?.nome}</h1>
              <div className="perfil-badges">
                <span className="perfil-badge">{getTipoLabel(user?.tipo || '')}</span>
                {user?.promoterStatus && (
                  <span className={`perfil-badge perfil-badge-${user.promoterStatus.toLowerCase()}`}>
                    {getStatusLabel(user.promoterStatus)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
            <div className="perfil-form-section">
              <h3>Informações Pessoais</h3>
              <Input
                label="Nome completo"
                type="text"
                error={errors.nome?.message}
                disabled={!isEditing}
                {...register('nome')}
              />
              <Input
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
                helperText="O email não pode ser alterado"
              />
            </div>

            <div className="perfil-form-actions">
              {isEditing ? (
                <>
                  <Button variant="outline" type="button" onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    Salvar alterações
                  </Button>
                </>
              ) : (
                <Button variant="primary" type="button" onClick={() => setIsEditing(true)}>
                  Editar perfil
                </Button>
              )}
            </div>
          </form>

          <div className="perfil-meta">
            <div className="perfil-meta-item">
              <Calendar size={16} />
              <span>
                Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
              </span>
            </div>
          </div>

          {/* Seção de Promoter */}
          {promoterStatus && (
            <div className="perfil-promoter-section">
              <h3>Tornar-se Promoter</h3>
              <div className="perfil-promoter-info">
                <p>
                  Promoters são usuários autorizados a criar e gerenciar eventos culturais na plataforma.
                  Após sua solicitação ser aprovada por um administrador, você poderá:
                </p>
                <ul>
                  <li>Criar eventos culturais</li>
                  <li>Gerenciar seus eventos</li>
                  <li>Ver inscrições nos seus eventos</li>
                </ul>
              </div>

              {promoterStatus.canRequest && (
                <div className="perfil-promoter-action">
                  <p className="perfil-promoter-warning">
                    Ao solicitar ser promoter, você concorda em seguir as diretrizes da plataforma
                    e criar apenas eventos culturais legítimos e adequados.
                  </p>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      setIsRequesting(true);
                      try {
                        await solicitarPromoter();
                      } catch (error) {
                        // Erro já tratado no store
                      } finally {
                        setIsRequesting(false);
                      }
                    }}
                    loading={isRequesting}
                    disabled={isRequesting}
                  >
                    <UserPlus size={16} />
                    Solicitar ser Promoter
                  </Button>
                </div>
              )}

              {user?.tipo === 'PROMOTER' && !user.approvedAt && (
                <div className="perfil-promoter-pending">
                  <Clock size={20} />
                  <div>
                    <h4>Aguardando Aprovação</h4>
                    <p>
                      Sua solicitação foi enviada e está aguardando aprovação de um administrador.
                      Você será notificado quando sua solicitação for revisada.
                    </p>
                  </div>
                </div>
              )}

              {user?.tipo === 'PROMOTER' && user.approvedAt && (
                <div className="perfil-promoter-approved">
                  <CheckCircle size={20} />
                  <div>
                    <h4>Você é um Promoter Aprovado!</h4>
                    <p>
                      Parabéns! Você foi aprovado como promoter. Agora você pode criar e gerenciar eventos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

