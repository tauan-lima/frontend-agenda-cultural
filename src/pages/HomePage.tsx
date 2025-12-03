import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar as CalendarIcon, MapPin, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, isEventPast } from '../utils/dateHelpers';
import { eventosService } from '../services/api/eventos';
import { eventosSalvosService } from '../services/api/eventosSalvos';
import { inscricoesService } from '../services/api/inscricoes';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import './HomePage.css';

export const HomePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuthStore();

  // Carregar eventos salvos e inscrições do usuário
  const { data: eventosSalvosData } = useQuery({
    queryKey: ['eventos-salvos'],
    queryFn: () => eventosSalvosService.getEventosSalvos(),
    enabled: isAuthenticated,
  });

  const { data: inscricoesData } = useQuery({
    queryKey: ['minhas-inscricoes'],
    queryFn: () => inscricoesService.getMinhasInscricoes(),
    enabled: isAuthenticated,
  });

  // Extrair IDs dos eventos salvos e inscritos
  const eventosSalvosIds = new Set(
    Array.isArray(eventosSalvosData)
      ? eventosSalvosData.map((item: any) => item.event?.id || item.eventId || item.evento?.id)
      : []
  );

  const eventosInscritosIds = new Set(
    Array.isArray(inscricoesData)
      ? inscricoesData.map((item: any) => item.event?.id || item.eventId)
      : []
  );

  const { data: eventosResponse, isLoading } = useQuery({
    queryKey: ['eventos', { search, page }],
    queryFn: () => eventosService.getEventos({ search, page, limit: 12 }),
  });

  // Extrair eventos e paginação da resposta
  const eventos = Array.isArray(eventosResponse)
    ? eventosResponse
    : eventosResponse?.events || [];
  const pagination = eventosResponse?.pagination;

  const salvarMutation = useMutation({
    mutationFn: (eventId: string) => eventosSalvosService.salvarEvento(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-salvos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Evento salvo!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar evento');
    },
  });

  const removerSalvoMutation = useMutation({
    mutationFn: (eventId: string) => eventosSalvosService.removerEventoSalvo(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-salvos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Evento removido dos salvos');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover evento');
    },
  });

  const inscreverMutation = useMutation({
    mutationFn: (eventId: string) => inscricoesService.inscrever(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhas-inscricoes'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Inscrição realizada com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erro ao se inscrever';
      if (errorMessage.includes('autenticado')) {
        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const handleToggleFavorito = async (eventoId: string) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const isSaved = eventosSalvosIds.has(eventoId);
    if (isSaved) {
      removerSalvoMutation.mutate(eventoId);
    } else {
      salvarMutation.mutate(eventoId);
    }
  };

  const handleInscrever = async (eventoId: string) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/eventos/${eventoId}`)}`);
      return;
    }

    inscreverMutation.mutate(eventoId);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Descubra eventos culturais incríveis</h1>
          <p className="hero-subtitle">Explore shows, exposições, workshops e muito mais</p>

          <div className="hero-search">
            <div className="search-wrapper">
              <Search size={20} className="search-icon" />
              <Input
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <Button variant="primary" size="md">
              Buscar
            </Button>
          </div>
        </div>
      </section>

      <section className="eventos-section">
        <div className="container">
          <h2 className="section-title">Eventos em Destaque</h2>

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
              icon={<CalendarIcon size={48} />}
              title="Nenhum evento encontrado"
              description="Tente buscar com outros termos ou volte mais tarde"
            />
          ) : (
            <div className="eventos-grid">
              {eventos.map((evento: any) => (
                <Card key={evento.id} hover className="evento-card">
                  <div className="evento-image-wrapper">
                    {evento.imagemUrl ? (
                      <img src={evento.imagemUrl} alt={evento.titulo} className="evento-image" />
                    ) : (
                      <div className="evento-image-placeholder">
                        <CalendarIcon size={48} />
                      </div>
                    )}
                    <button
                      className={`evento-favorito-btn ${eventosSalvosIds.has(evento.id) ? 'saved' : ''}`}
                      onClick={() => handleToggleFavorito(evento.id)}
                      aria-label={eventosSalvosIds.has(evento.id) ? 'Remover dos salvos' : 'Salvar evento'}
                    >
                      <Heart size={20} fill={eventosSalvosIds.has(evento.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="evento-content">
                    <h3 className="evento-title">{evento.titulo}</h3>
                    <div className="evento-info">
                      <div className="evento-info-item">
                        <CalendarIcon size={16} />
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
                    <div className="evento-actions">
                      {evento.requerInscricao ? (
                        eventosInscritosIds.has(evento.id) ? (
                          <Button variant="outline" size="sm" disabled>
                            ✅ Inscrito
                          </Button>
                        ) : isEventPast(evento.dataFim) ? (
                          <Button variant="outline" size="sm" disabled>
                            Evento Encerrado
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleInscrever(evento.id)}
                            loading={inscreverMutation.isPending}
                          >
                            Inscrever-se
                          </Button>
                        )
                      ) : (
                        <span className="public-event-badge">Evento Aberto ao Público</span>
                      )}
                      <Link to={`/eventos/${evento.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="pagination-info">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

