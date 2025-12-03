import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Agenda Cultural</h4>
            <p>Descubra eventos culturais incríveis na sua cidade.</p>
          </div>
          <div className="footer-section">
            <h4>Links</h4>
            <Link to="/eventos">Eventos</Link>
            <Link to="/sobre">Sobre</Link>
          </div>
          <div className="footer-section">
            <h4>Conta</h4>
            <Link to="/login">Login</Link>
            <Link to="/registro">Registro</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Agenda Cultural. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

