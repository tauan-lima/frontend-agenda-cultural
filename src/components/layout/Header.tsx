import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Calendar, Heart, Settings, Plus, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { canCreateEvents, isAdmin } from '../../utils/userHelpers';
import { Button } from '../ui/Button';
import './Header.css';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Verificar se o usuário pode criar eventos (promoter aprovado ou admin)
  const canCreate = canCreateEvents(user);

  // Verificar se o usuário é admin
  const userIsAdmin = isAdmin(user);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <Calendar size={24} />
          <span>Agenda Cultural</span>
        </Link>

        <nav className={`header-nav ${mobileMenuOpen ? 'header-nav-open' : ''}`}>
          <Link to="/eventos" className="header-nav-link">
            Eventos
          </Link>
          <Link to="/sobre" className="header-nav-link">
            Sobre
          </Link>

          {isAuthenticated ? (
            <div className="header-user-menu">
              <button
                className="header-user-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Menu do usuário"
              >
                <div className="header-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.nome} />
                  ) : (
                    <span>{getInitials(user?.nome || '')}</span>
                  )}
                </div>
                <span className="header-user-name">{user?.nome}</span>
              </button>

              {userMenuOpen && (
                <div className="header-dropdown">
                  {canCreate && (
                    <>
                      <Link
                        to="/criar-evento"
                        className="header-dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Plus size={16} />
                        Criar Evento
                      </Link>
                      <Link
                        to="/meus-eventos"
                        className="header-dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Calendar size={16} />
                        Meus Eventos
                      </Link>
                    </>
                  )}
                  <Link
                    to="/eventos-salvos"
                    className="header-dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Heart size={16} />
                    Eventos Salvos
                  </Link>
                  <Link
                    to="/perfil"
                    className="header-dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Perfil
                  </Link>
                  {userIsAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="header-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <BarChart3 size={16} />
                      Dashboard Admin
                    </Link>
                  )}
                  <div className="header-dropdown-divider" />
                  <button className="header-dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header-actions">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/registro')}>
                Registro
              </Button>
            </div>
          )}
        </nav>

        <button
          className="header-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
};

