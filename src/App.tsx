import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import DashboardPage from './pages/DashboardPage';
import QuestoesPage from './pages/QuestoesPage';
import DissertativaPage from './pages/DissertativaPage';
import ObjetivaPage from './pages/ObjetivaPage';
import EstatisticasPage from './pages/EstatisticasPage';
import EstudosPage from './pages/EstudosPage';
import PerfilPage from './pages/PerfilPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questoes"
                element={
                  <ProtectedRoute>
                    <QuestoesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dissertativa"
                element={
                  <ProtectedRoute>
                    <DissertativaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/objetiva"
                element={
                  <ProtectedRoute>
                    <ObjetivaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estatisticas"
                element={
                  <ProtectedRoute>
                    <EstatisticasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estudos"
                element={
                  <ProtectedRoute>
                    <EstudosPage />
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
            </Routes>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
