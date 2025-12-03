import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotersService } from '../services/api/promoters';
import { eventosService } from '../services/api/eventos';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import './AdminPage.css';

export const AdminPage = () => {
  const location = useLocation();

  return (
    <div className="admin-page">
      <div className="admin-container">
        <aside className="admin-sidebar">
          <h2>Painel Admin</h2>
          <nav className="admin-nav">
            <Link
              to="/admin/promoters"
              className={`admin-nav-link ${location.pathname.includes('/promoters') ? 'active' : ''}`}
            >
              <Users size={20} />
              Promoters Pendentes
            </Link>
            <Link
              to="/admin/eventos"
              className={`admin-nav-link ${location.pathname.includes('/eventos') ? 'active' : ''}`}
            >
              <Calendar size={20} />
              Eventos Pendentes
            </Link>
          </nav>
        </aside>

        <main className="admin-content">
          <Routes>
            <Route path="/promoters" element={<PromotersPendentes />} />
            <Route path="/eventos" element={<EventosPendentes />} />
            <Route path="/" element={<PromotersPendentes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const PromotersPendentes = () => {
  const queryClient = useQueryClient();

  const { data: promotersData, isLoading } = useQuery({
    queryKey: ['promoters-pendentes'],
    queryFn: () => promotersService.getPromotersPendentes(),
  });

  // Garantir que promoters é sempre um array
  const promoters = Array.isArray(promotersData) ? promotersData : [];

  const aprovarMutation = useMutation({
    mutationFn: (id: string) => promotersService.aprovarPromoter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoters-pendentes'] });
      toast.success('Promoter aprovado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao aprovar promoter');
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: (id: string) => promotersService.rejeitarPromoter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoters-pendentes'] });
      toast.success('Promoter rejeitado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao rejeitar promoter');
    },
  });

  if (isLoading) {
    return (
      <div>
        <h1>Promoters Pendentes</h1>
        {[...Array(3)].map((_, i) => (
          <Card key={i} style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <Skeleton height={24} width="40%" />
            <div style={{ marginTop: '0.5rem' }}>
              <Skeleton height={16} width="60%" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (promoters.length === 0) {
    return (
      <>
        <h1>Promoters Pendentes</h1>
        <EmptyState
          icon={<Users size={48} />}
          title="Nenhum promoter pendente"
          description="Todos os promoters foram revisados"
        />
      </>
    );
  }

  return (
    <>
      <h1>Promoters Pendentes</h1>
      <div className="admin-list">
        {promoters.map((promoter: any) => (
          <Card key={promoter.id} className="admin-item">
            <div className="admin-item-content">
              <div>
                <h3>{promoter.name || promoter.nome}</h3>
                <p>{promoter.email}</p>
                <p className="admin-item-meta">
                  Cadastrado em {promoter.createdAt ? new Date(promoter.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </p>
              </div>
              <div className="admin-item-actions">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => aprovarMutation.mutate(promoter.id)}
                  loading={aprovarMutation.isPending}
                >
                  <CheckCircle size={16} />
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rejeitarMutation.mutate(promoter.id)}
                  loading={rejeitarMutation.isPending}
                >
                  <XCircle size={16} />
                  Rejeitar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};

const EventosPendentes = () => {
  const queryClient = useQueryClient();
  const [selectedEvento, setSelectedEvento] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [eventoToReject, setEventoToReject] = useState<string | null>(null);

  const { data: eventosData, isLoading } = useQuery({
    queryKey: ['eventos-pendentes'],
    queryFn: () => eventosService.getEventosPendentes(),
  });

  // Extrair eventos e paginação da resposta
  const eventos = eventosData?.events || [];
  const pagination = eventosData?.pagination;

  const aprovarMutation = useMutation({
    mutationFn: (id: string) => eventosService.aprovarEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-pendentes'] });
      toast.success('Evento aprovado com sucesso!');
      setSelectedEvento(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao aprovar evento');
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      eventosService.rejeitarEvento(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-pendentes'] });
      toast.success('Evento rejeitado');
      setSelectedEvento(null);
      setShowRejectModal(false);
      setRejectionReason('');
      setEventoToReject(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao rejeitar evento');
    },
  });

  const handleRejectClick = (eventoId: string) => {
    setEventoToReject(eventoId);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      toast.error('O motivo da rejeição deve ter no mínimo 5 caracteres');
      return;
    }
    if (eventoToReject) {
      rejeitarMutation.mutate({ id: eventoToReject, rejectionReason: rejectionReason.trim() });
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1>Eventos Pendentes</h1>
        {[...Array(3)].map((_, i) => (
          <Card key={i} style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <Skeleton height={200} />
            <div style={{ marginTop: '1rem' }}>
              <Skeleton height={24} width="60%" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <>
        <h1>Eventos Pendentes</h1>
        <EmptyState
          icon={<Calendar size={48} />}
          title="Nenhum evento pendente"
          description="Todos os eventos foram revisados"
        />
      </>
    );
  }

  return (
    <>
      <h1>Eventos Pendentes</h1>
      <div className="admin-list">
        {eventos.map((evento: any) => (
          <Card key={evento.id} className="admin-item">
            <div className="admin-item-content">
              {evento.imagemUrl && (
                <img src={evento.imagemUrl} alt={evento.titulo} className="admin-item-image" />
              )}
              <div className="admin-item-details">
                <h3>{evento.titulo}</h3>
                <p>{evento.descricao}</p>
                <p className="admin-item-meta">
                  Por {evento.promoter?.name || evento.promoter?.nome || 'Promoter'} •{' '}
                  {evento.createdAt ? new Date(evento.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </p>
              </div>
              <div className="admin-item-actions">
                <Button variant="outline" size="sm" onClick={() => setSelectedEvento(evento)}>
                  Ver detalhes
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => aprovarMutation.mutate(evento.id)}
                  loading={aprovarMutation.isPending}
                >
                  <CheckCircle size={16} />
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectClick(evento.id)}
                  loading={rejeitarMutation.isPending}
                >
                  <XCircle size={16} />
                  Rejeitar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedEvento}
        onClose={() => setSelectedEvento(null)}
        title={selectedEvento?.titulo}
        size="lg"
      >
        {selectedEvento && (
          <div>
            {selectedEvento.imagemUrl && (
              <img
                src={selectedEvento.imagemUrl}
                alt={selectedEvento.titulo}
                style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}
              />
            )}
            <p>{selectedEvento.descricao}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                onClick={() => aprovarMutation.mutate(selectedEvento.id)}
                loading={aprovarMutation.isPending}
              >
                Aprovar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRejectClick(selectedEvento.id)}
                loading={rejeitarMutation.isPending}
              >
                Rejeitar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Rejeição */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
          setEventoToReject(null);
        }}
        title="Rejeitar Evento"
        size="md"
      >
        <div>
          <p style={{ marginBottom: '1rem' }}>
            Por favor, informe o motivo da rejeição (mínimo 5 caracteres):
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Digite o motivo da rejeição..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
                setEventoToReject(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReject}
              loading={rejeitarMutation.isPending}
              disabled={!rejectionReason || rejectionReason.trim().length < 5}
            >
              Confirmar Rejeição
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

