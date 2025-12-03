import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { eventosService } from '../services/api/eventos';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { CalendarIcon, MapPin, Users } from 'lucide-react';
import { formatDate } from '../utils/dateHelpers';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import './EventosPage.css';

export const EventosPage = () => {
  const [search, setSearch] = useState('');

  const { data: eventosResponse, isLoading } = useQuery({
    queryKey: ['eventos', { search }],
    queryFn: () => eventosService.getEventos({ search }),
  });

  // Extrair eventos da resposta (pode ser array ou objeto com events)
  const eventos = Array.isArray(eventosResponse)
    ? eventosResponse
    : eventosResponse?.events || [];

  return (
    <div className="eventos-page">
      <div className="container">
        <div className="eventos-header">
          <h1>Eventos</h1>
          <div className="eventos-search">
            <div className="search-wrapper">
              <Search size={20} className="search-icon" />
              <Input
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
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
            icon={<CalendarIcon size={48} />}
            title="Nenhum evento encontrado"
            description="Tente buscar com outros termos"
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
                  <Link to={`/eventos/${evento.id}`}>
                    <Button variant="primary" size="sm" className="evento-button">
                      Ver detalhes
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

