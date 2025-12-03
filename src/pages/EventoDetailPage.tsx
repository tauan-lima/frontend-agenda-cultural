import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Users, Heart, Share2, Edit, X } from 'lucide-react';
import { formatDate } from '../utils/dateHelpers';
import { eventosService } from '../services/api/eventos';
import { inscricoesService } from '../services/api/inscricoes';
import { eventosSalvosService } from '../services/api/eventosSalvos';
import { useAuthStore } from '../stores/authStore';
import { isAdmin } from '../utils/userHelpers';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import './EventoDetailPage.css';

export const EventoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  const { data: evento, isLoading } = useQuery({
    queryKey: ['evento', id],
    queryFn: () => eventosService.getEvento(id!),
    enabled: !!id,
  });

  const inscreverMutation = useMutation({
    mutationFn: () => inscricoesService.inscrever(evento!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evento', id] });
      toast.success('Inscrição realizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao se inscrever');
    },
  });

  const cancelarInscricaoMutation = useMutation({
    mutationFn: () => inscricoesService.cancelarInscricao(evento!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evento', id] });
      toast.success('Inscrição cancelada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar inscrição');
    },
  });

  const toggleFavoritoMutation = useMutation({
    mutationFn: async () => {
      if (evento!.favorito) {
        await eventosSalvosService.removerEventoSalvo(evento!.id);
      } else {
        await eventosSalvosService.salvarEvento(evento!.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evento', id] });
      toast.success(evento!.favorito ? 'Evento removido dos salvos' : 'Evento salvo!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar evento');
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: evento?.titulo,
          text: evento?.descricao,
          url: window.location.href,
        });
      } catch (error) {
        // Usuário cancelou ou erro
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const isOwner = evento && user?.id === evento.promoterId;
  const userIsAdmin = isAdmin(user);

  if (isLoading) {
    return (
      <div className="evento-detail-page">
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <Skeleton height={400} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <Skeleton height={32} width="60%" />
          </div>
          <Skeleton height={20} width="80%" />
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="evento-detail-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>Evento não encontrado</h2>
            <Button onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
              Voltar para home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="evento-detail-page">
      <div className="container">
        <Button variant="ghost" onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Voltar
        </Button>

        <div className="evento-detail-hero">
          {evento.imagemUrl ? (
            <img src={evento.imagemUrl} alt={evento.titulo} className="evento-detail-image" />
          ) : (
            <div className="evento-detail-image-placeholder">
              <Calendar size={64} />
            </div>
          )}
        </div>

        <div className="evento-detail-content">
          <div className="evento-detail-main">
            <div className="evento-detail-header">
              <h1>{evento.titulo}</h1>
              {(isOwner || userIsAdmin) && (
                <span className={`evento-status-badge evento-status-${evento.status.toLowerCase()}`}>
                  {evento.status === 'APPROVED' && 'Aprovado'}
                  {evento.status === 'PENDING' && 'Pendente'}
                  {evento.status === 'REJECTED' && 'Rejeitado'}
                  {evento.status === 'CANCELLED' && 'Cancelado'}
                </span>
              )}
            </div>

            <div className="evento-detail-info">
              <div className="evento-detail-info-item">
                <Calendar size={20} />
                <div>
                  <strong>Data e hora</strong>
                  <p>
                    {formatDate(evento.dataInicio)}
                  </p>
                </div>
              </div>

              <div className="evento-detail-info-item">
                <MapPin size={20} />
                <div>
                  <strong>Localização</strong>
                  <p>{evento.localizacao}</p>
                </div>
              </div>

              {evento.promoter && (
                <div className="evento-detail-info-item">
                  <Users size={20} />
                  <div>
                    <strong>Promoter</strong>
                    <p>{evento.promoter.nome}</p>
                  </div>
                </div>
              )}

              {evento.requerInscricao && (
                <div className="evento-detail-info-item">
                  <Users size={20} />
                  <div>
                    <strong>Inscritos</strong>
                    <p>{evento.inscritos || 0} pessoas</p>
                  </div>
                </div>
              )}
            </div>

            <Card className="evento-detail-description">
              <h3>Descrição</h3>
              <p>{evento.descricao}</p>
            </Card>
          </div>

          <div className="evento-detail-sidebar">
            <Card className="evento-detail-actions">
              {!isAuthenticated ? (
                <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
                  Entrar para se inscrever
                </Button>
              ) : (
                <>
                  {isOwner ? (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate(`/criar-evento?edit=${evento.id}`)}
                      >
                        <Edit size={20} />
                        Editar evento
                      </Button>
                      {evento.status === 'APPROVED' && (
                        <Button variant="outline" size="lg" onClick={() => {}}>
                          <X size={20} />
                          Cancelar evento
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {evento.requerInscricao ? (
                        evento.inscrito ? (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => cancelarInscricaoMutation.mutate()}
                            loading={cancelarInscricaoMutation.isPending}
                          >
                            Cancelar inscrição
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => inscreverMutation.mutate()}
                            loading={inscreverMutation.isPending}
                          >
                            Inscrever-se
                          </Button>
                        )
                      ) : (
                        <div className="evento-open-badge">
                          <span>Evento aberto ao público</span>
                        </div>
                      )}

                      <Button
                        variant={evento.favorito ? 'secondary' : 'outline'}
                        size="lg"
                        onClick={() => toggleFavoritoMutation.mutate()}
                        loading={toggleFavoritoMutation.isPending}
                      >
                        <Heart size={20} fill={evento.favorito ? 'currentColor' : 'none'} />
                        {evento.favorito ? 'Remover dos salvos' : 'Salvar evento'}
                      </Button>
                    </>
                  )}

                  <Button variant="ghost" size="lg" onClick={handleShare}>
                    <Share2 size={20} />
                    Compartilhar
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

