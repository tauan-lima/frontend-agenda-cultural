import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, CheckCircle } from 'lucide-react';
import { formatDate, isEventPast, normalizeEvento } from '../utils/dateHelpers';
import { eventosSalvosService } from '../services/api/eventosSalvos';
import { inscricoesService } from '../services/api/inscricoes';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import './EventosSalvosPage.css';

export const EventosSalvosPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'registered'>('all');

  const { data: eventosSalvosData, isLoading: isLoadingSaved } = useQuery({
    queryKey: ['eventos-salvos'],
    queryFn: () => eventosSalvosService.getEventosSalvos(),
    enabled: isAuthenticated,
  });

  const { data: inscricoesData, isLoading: isLoadingRegistered } = useQuery({
    queryKey: ['minhas-inscricoes'],
    queryFn: () => inscricoesService.getMinhasInscricoes(),
    enabled: isAuthenticated,
  });

  // Extrair eventos dos dados
  const eventosSalvos = Array.isArray(eventosSalvosData)
    ? eventosSalvosData.map((item: any) => ({
        id: item.id,
        eventId: item.event?.id || item.eventId || item.evento?.id,
        evento: item.event || item.evento,
      }))
    : [];

  const eventosInscritos = Array.isArray(inscricoesData)
    ? inscricoesData.map((item: any) => ({
        id: item.id,
        eventId: item.event?.id || item.eventId,
        evento: item.event,
      }))
    : [];

  // Combinar eventos únicos e normalizar estrutura
  const allEventsMap = new Map();

  eventosSalvos.forEach((item) => {
    if (item.evento) {
      const evento = normalizeEvento(item.evento);
      if (evento) {
        allEventsMap.set(item.eventId, { ...evento, isSaved: true, isRegistered: false });
      }
    }
  });

  eventosInscritos.forEach((item) => {
    if (item.evento) {
      const evento = normalizeEvento(item.evento);
      if (evento) {
        const existing = allEventsMap.get(item.eventId);
        if (existing) {
          existing.isRegistered = true;
        } else {
          allEventsMap.set(item.eventId, { ...evento, isSaved: false, isRegistered: true });
        }
      }
    }
  });

  const allEvents = Array.from(allEventsMap.values());

  const isLoading = isLoadingSaved || isLoadingRegistered;

  const removerSalvoMutation = useMutation({
    mutationFn: (eventId: string) => eventosSalvosService.removerEventoSalvo(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-salvos'] });
      toast.success('Evento removido dos salvos');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover evento');
    },
  });

  const cancelarInscricaoMutation = useMutation({
    mutationFn: (eventId: string) => inscricoesService.cancelarInscricao(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhas-inscricoes'] });
      toast.success('Inscrição cancelada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar inscrição');
    },
  });

  const salvarMutation = useMutation({
    mutationFn: (eventId: string) => eventosSalvosService.salvarEvento(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-salvos'] });
      toast.success('Evento salvo!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar evento');
    },
  });

  const inscreverMutation = useMutation({
    mutationFn: (eventId: string) => inscricoesService.inscrever(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhas-inscricoes'] });
      toast.success('Inscrição realizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao se inscrever');
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const getEventosToShow = () => {
    switch (activeTab) {
      case 'saved':
        return eventosSalvos.map((item) => item.evento).filter(Boolean);
      case 'registered':
        return eventosInscritos.map((item) => item.evento).filter(Boolean);
      default:
        return allEvents;
    }
  };

  const eventosToShow = getEventosToShow();

  return (
    <div className="eventos-salvos-page">
      <div className="container">
        <h1>Meus Eventos</h1>

        <div className="eventos-tabs">
          <button
            className={`eventos-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todos ({allEvents.length})
          </button>
          <button
            className={`eventos-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Salvos ({eventosSalvos.length})
          </button>
          <button
            className={`eventos-tab ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            Inscritos ({eventosInscritos.length})
          </button>
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
        ) : eventosToShow.length === 0 ? (
          <EmptyState
            icon={<Heart size={48} />}
            title={
              activeTab === 'saved'
                ? 'Nenhum evento salvo'
                : activeTab === 'registered'
                ? 'Nenhum evento inscrito'
                : 'Nenhum evento salvo ou inscrito'
            }
            description={
              activeTab === 'saved'
                ? 'Salve eventos que você gostou para acessá-los facilmente depois'
                : activeTab === 'registered'
                ? 'Inscreva-se em eventos para acompanhá-los'
                : 'Salve ou inscreva-se em eventos para vê-los aqui'
            }
          />
        ) : (
          <div className="eventos-grid">
            {eventosToShow.map((evento: any) => {
              const isSaved = evento.isSaved || eventosSalvos.some((item) => item.eventId === evento.id);
              const isRegistered = evento.isRegistered || eventosInscritos.some((item) => item.eventId === evento.id);
              const isPast = isEventPast(evento.dataFim);

              return (
                <Card key={evento.id} hover className="evento-card">
                  <div className="evento-image-wrapper">
                    {evento.imagemUrl ? (
                      <img src={evento.imagemUrl} alt={evento.titulo} className="evento-image" />
                    ) : (
                      <div className="evento-image-placeholder">
                        <Calendar size={48} />
                      </div>
                    )}
                    <div className="evento-badges">
                      {isSaved && (
                        <span className="evento-badge evento-badge-saved">
                          <Heart size={14} fill="currentColor" />
                          Salvo
                        </span>
                      )}
                      {isRegistered && (
                        <span className="evento-badge evento-badge-registered">
                          <CheckCircle size={14} />
                          Inscrito
                        </span>
                      )}
                    </div>
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
                    <div className="evento-actions">
                      {isSaved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerSalvoMutation.mutate(evento.id)}
                          loading={removerSalvoMutation.isPending}
                        >
                          Remover dos Salvos
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => salvarMutation.mutate(evento.id)}
                          loading={salvarMutation.isPending}
                        >
                          <Heart size={16} />
                          Salvar
                        </Button>
                      )}
                      {evento.requerInscricao &&
                        (isRegistered ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelarInscricaoMutation.mutate(evento.id)}
                            loading={cancelarInscricaoMutation.isPending}
                          >
                            Cancelar Inscrição
                          </Button>
                        ) : (
                          !isPast && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => inscreverMutation.mutate(evento.id)}
                              loading={inscreverMutation.isPending}
                            >
                              Inscrever-se
                            </Button>
                          )
                        ))}
                      <Link to={`/eventos/${evento.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

