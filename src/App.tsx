import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventosPage } from './pages/EventosPage';
import { EventoDetailPage } from './pages/EventoDetailPage';
import { MeusEventosPage } from './pages/MeusEventosPage';
import { CriarEventoPage } from './pages/CriarEventoPage';
import { EventosSalvosPage } from './pages/EventosSalvosPage';
import { PerfilPage } from './pages/PerfilPage';
import { AdminPage } from './pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/eventos" element={<EventosPage />} />
            <Route path="/eventos/:id" element={<EventoDetailPage />} />
            <Route path="/sobre" element={<div className="container" style={{ padding: '4rem 1rem' }}><h1>Sobre</h1><p>Página sobre a Agenda Cultural</p></div>} />

            <Route
              path="/meus-eventos"
              element={
                <ProtectedRoute requirePromoter>
                  <MeusEventosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/criar-evento"
              element={
                <ProtectedRoute requirePromoter>
                  <CriarEventoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventos-salvos"
              element={
                <ProtectedRoute>
                  <EventosSalvosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <PerfilPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
