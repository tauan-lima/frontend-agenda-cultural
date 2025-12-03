import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  UserCheck,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { statsService } from '../services/api/stats';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import './DashboardAdminPage.css';

export const DashboardAdminPage = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => statsService.getStats(),
  });

  if (isLoading) {
    return (
      <div className="dashboard-admin-page">
        <h1>Dashboard Administrativo</h1>
        <div className="dashboard-grid">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="stat-card">
              <Skeleton height={60} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-admin-page">
        <h1>Dashboard Administrativo</h1>
        <Card>
          <p>Erro ao carregar estatísticas. Tente novamente mais tarde.</p>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-admin-page">
        <h1>Dashboard Administrativo</h1>
        <Card>
          <p>Nenhum dado disponível.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-admin-page">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <p className="dashboard-subtitle">Visão geral do sistema</p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="stats-grid">
        <Card className="stat-card stat-card-primary">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total de Usuários</h3>
            <p className="stat-value">{stats.totalUsuarios}</p>
            <p className="stat-label">
              {stats.totalUsuariosAtivos} ativos • {stats.totalPromoters} promoters
            </p>
          </div>
        </Card>

        <Card className="stat-card stat-card-success">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>Total de Eventos</h3>
            <p className="stat-value">{stats.totalEventos}</p>
            <p className="stat-label">
              {stats.eventosPorStatus.APPROVED} aprovados • {stats.eventosPorStatus.PENDING} pendentes
            </p>
          </div>
        </Card>

        <Card className="stat-card stat-card-info">
          <div className="stat-icon">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>Total de Inscrições</h3>
            <p className="stat-value">{stats.totalInscritos}</p>
            <p className="stat-label">Inscrições realizadas</p>
          </div>
        </Card>

        <Card className="stat-card stat-card-warning">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Promoters Pendentes</h3>
            <p className="stat-value">{stats.promotersPendentes}</p>
            <p className="stat-label">
              {stats.promotersAprovados} aprovados • {stats.promotersPendentes} aguardando
            </p>
          </div>
        </Card>
      </div>

      {/* Eventos por Status */}
      <Card className="dashboard-section">
        <h2 className="section-title">
          <BarChart3 size={20} />
          Eventos por Status
        </h2>
        <div className="status-grid">
          <div className="status-item status-pending">
            <Clock size={20} />
            <div>
              <p className="status-value">{stats.eventosPorStatus.PENDING}</p>
              <p className="status-label">Pendentes</p>
            </div>
          </div>
          <div className="status-item status-approved">
            <CheckCircle size={20} />
            <div>
              <p className="status-value">{stats.eventosPorStatus.APPROVED}</p>
              <p className="status-label">Aprovados</p>
            </div>
          </div>
          <div className="status-item status-rejected">
            <XCircle size={20} />
            <div>
              <p className="status-value">{stats.eventosPorStatus.REJECTED}</p>
              <p className="status-label">Rejeitados</p>
            </div>
          </div>
          <div className="status-item status-cancelled">
            <XCircle size={20} />
            <div>
              <p className="status-value">{stats.eventosPorStatus.CANCELLED}</p>
              <p className="status-label">Cancelados</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Taxa de Aceitação */}
      <div className="dashboard-row">
        <Card className="dashboard-section">
          <h2 className="section-title">
            <TrendingUp size={20} />
            Taxa de Aceitação - Eventos
          </h2>
          <div className="acceptance-stats">
            <div className="acceptance-item">
              <p className="acceptance-label">Aprovados</p>
              <p className="acceptance-value approved">{stats.taxaAceitacao.eventos.aprovados}</p>
            </div>
            <div className="acceptance-item">
              <p className="acceptance-label">Rejeitados</p>
              <p className="acceptance-value rejected">{stats.taxaAceitacao.eventos.rejeitados}</p>
            </div>
            <div className="acceptance-bar">
              <div
                className="acceptance-bar-fill approved"
                style={{
                  width: `${stats.taxaAceitacao.eventos.taxaAprovacao}%`,
                }}
              />
            </div>
            <p className="acceptance-percentage">
              {stats.taxaAceitacao.eventos.taxaAprovacao.toFixed(1)}% de aprovação
            </p>
          </div>
        </Card>

        <Card className="dashboard-section">
          <h2 className="section-title">
            <TrendingUp size={20} />
            Taxa de Aceitação - Promoters
          </h2>
          <div className="acceptance-stats">
            <div className="acceptance-item">
              <p className="acceptance-label">Aprovados</p>
              <p className="acceptance-value approved">{stats.taxaAceitacao.promoters.aprovados}</p>
            </div>
            <div className="acceptance-item">
              <p className="acceptance-label">Rejeitados</p>
              <p className="acceptance-value rejected">{stats.taxaAceitacao.promoters.rejeitados}</p>
            </div>
            <div className="acceptance-bar">
              <div
                className="acceptance-bar-fill approved"
                style={{
                  width: `${stats.taxaAceitacao.promoters.taxaAprovacao}%`,
                }}
              />
            </div>
            <p className="acceptance-percentage">
              {stats.taxaAceitacao.promoters.taxaAprovacao.toFixed(1)}% de aprovação
            </p>
          </div>
        </Card>
      </div>

      {/* Locais Mais Populares */}
      <Card className="dashboard-section">
        <h2 className="section-title">
          <MapPin size={20} />
          Locais Mais Populares
        </h2>
        {stats.locaisMaisPopulares.length === 0 ? (
          <p className="empty-message">Nenhum dado disponível</p>
        ) : (
          <div className="locations-list">
            {stats.locaisMaisPopulares.slice(0, 10).map((local, index) => (
              <div key={index} className="location-item">
                <div className="location-rank">#{index + 1}</div>
                <div className="location-info">
                  <p className="location-name">{local.localizacao}</p>
                  <p className="location-stats">
                    {local.totalEventos} eventos • {local.totalInscritos} inscrições
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Eventos por Mês */}
      {stats.eventosPorMes && stats.eventosPorMes.length > 0 && (
        <Card className="dashboard-section">
          <h2 className="section-title">
            <BarChart3 size={20} />
            Eventos por Mês
          </h2>
          <div className="monthly-stats">
            {stats.eventosPorMes.slice(-6).map((item, index) => (
              <div key={index} className="monthly-item">
                <p className="monthly-label">{item.mes}</p>
                <div className="monthly-bars">
                  <div className="monthly-bar-group">
                    <div
                      className="monthly-bar approved"
                      style={{
                        height: `${(item.aprovados / Math.max(...stats.eventosPorMes.map((m) => m.total))) * 100}%`,
                      }}
                      title={`${item.aprovados} aprovados`}
                    />
                    <div
                      className="monthly-bar pending"
                      style={{
                        height: `${(item.pendentes / Math.max(...stats.eventosPorMes.map((m) => m.total))) * 100}%`,
                      }}
                      title={`${item.pendentes} pendentes`}
                    />
                  </div>
                  <p className="monthly-value">{item.total}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Inscrições por Mês */}
      {stats.inscricoesPorMes && stats.inscricoesPorMes.length > 0 && (
        <Card className="dashboard-section">
          <h2 className="section-title">
            <TrendingUp size={20} />
            Inscrições por Mês
          </h2>
          <div className="monthly-stats">
            {stats.inscricoesPorMes.slice(-6).map((item, index) => {
              const maxInscricoes = Math.max(...stats.inscricoesPorMes.map((m) => m.total));
              return (
                <div key={index} className="monthly-item">
                  <p className="monthly-label">{item.mes}</p>
                  <div className="monthly-bars">
                    <div
                      className="monthly-bar info"
                      style={{
                        height: `${maxInscricoes > 0 ? (item.total / maxInscricoes) * 100 : 0}%`,
                      }}
                      title={`${item.total} inscrições`}
                    />
                    <p className="monthly-value">{item.total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

