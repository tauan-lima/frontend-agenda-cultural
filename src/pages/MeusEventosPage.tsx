import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Edit, X, Eye } from 'lucide-react';
import { formatDate } from '../utils/dateHelpers';
import { eventosService } from '../services/api/eventos';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './MeusEventosPage.css';

export const MeusEventosPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const cancelarMutation = useMutation({
    mutationFn: (id: string) => eventosService.cancelarEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meus-eventos'] });
      toast.success('Evento cancelado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar evento');
    },
  });

  const { data: eventosData, isLoading } = useQuery({
    queryKey: ['meus-eventos', user?.id, statusFilter],
    queryFn: () =>
      eventosService.getMeusEventos({
        status: statusFilter !== 'all' ? (statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED') : undefined,
      }),
    enabled: !!user?.id,
  });

  // Extrair eventos da resposta
  const eventos = eventosData?.events || [];

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'PENDING', label: 'Pendentes' },
    { id: 'APPROVED', label: 'Aprovados' },
    { id: 'REJECTED', label: 'Rejeitados' },
    { id: 'CANCELLED', label: 'Cancelados' },
  ];

  return (
    <div className="meus-eventos-page">
      <div className="container">
        <div className="meus-eventos-header">
          <h1>Meus Eventos</h1>
          <Button variant="primary" onClick={() => navigate('/criar-evento')}>
            <Plus size={20} />
            Criar evento
          </Button>
        </div>

        <div className="meus-eventos-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`meus-eventos-tab ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="eventos-grid">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="evento-card-skeleton">
                <Skeleton height={200} />
                <div style={{ marginTop: '1rem' }}>
                  <Skeleton height={24} width="80%" />
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <Skeleton height={16} width="60%" />
                </div>
              </Card>
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} />}
            title="Você ainda não criou eventos"
            description="Comece criando seu primeiro evento"
            action={
              <Button variant="primary" onClick={() => navigate('/criar-evento')}>
                Criar evento
              </Button>
            }
          />
        ) : (
          <div className="eventos-grid">
            {eventos.map((evento: any) => (
              <Card key={evento.id} className="evento-card-promoter">
                <div className="evento-image-wrapper">
                  {evento.imagemUrl ? (
                    <img src={evento.imagemUrl} alt={evento.titulo} className="evento-image" />
                  ) : (
                    <div className="evento-image-placeholder">
                      <Calendar size={48} />
                    </div>
                  )}
                  <span className={`evento-status-badge evento-status-${evento.status.toLowerCase()}`}>
                    {evento.status === 'APPROVED' && 'Aprovado'}
                    {evento.status === 'PENDING' && 'Pendente'}
                    {evento.status === 'REJECTED' && 'Rejeitado'}
                    {evento.status === 'CANCELLED' && 'Cancelado'}
                  </span>
                </div>
                <div className="evento-content">
                  <h3 className="evento-title">{evento.titulo}</h3>
                  <div className="evento-info">
                    <div className="evento-info-item">
                      <Calendar size={16} />
                      <span>
                        {formatDate(evento.dataInicio)}
                      </span>
                    </div>
                    <div className="evento-info-item">
                      <MapPin size={16} />
                      <span>{evento.localizacao}</span>
                    </div>
                    {evento.requerInscricao && (
                      <div className="evento-info-item">
                        <Users size={16} />
                        <span>{evento.inscritos || 0} inscritos</span>
                      </div>
                    )}
                  </div>
                  {evento.status === 'REJECTED' && evento.rejectionReason && (
                    <div className="evento-rejection-reason">
                      <strong>Motivo da rejeição:</strong> {evento.rejectionReason}
                    </div>
                  )}
                  <div className="evento-actions">
                    <Link to={`/eventos/${evento.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye size={16} />
                        Ver detalhes
                      </Button>
                    </Link>
                    {(evento.status === 'PENDING' || evento.status === 'APPROVED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/criar-evento?edit=${evento.id}`)}
                      >
                        <Edit size={16} />
                        Editar
                      </Button>
                    )}
                    {evento.status === 'REJECTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/criar-evento?edit=${evento.id}`)}
                      >
                        <Edit size={16} />
                        Editar e Reenviar
                      </Button>
                    )}
                    {evento.status === 'APPROVED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja cancelar este evento?')) {
                            cancelarMutation.mutate(evento.id);
                          }
                        }}
                        loading={cancelarMutation.isPending}
                      >
                        <X size={16} />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

