// ============================================================
// COMPONENTE RAIZ DE LA APLICACIÓN
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
// Agrego la HomePage que estaba faltando en el router
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { MateriasPage } from './pages/MateriasPage';
import { TareasPage } from './pages/TareasPage';
import { PerfilPage } from './pages/PerfilPage';
import { PoliticaPrivacidadPage } from './pages/PoliticaPrivacidadPage';
import { TerminosServicioPage } from './pages/TerminosServicioPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* RUTAS PUBLICAS */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Paginas legales, publicas (las necesito para el
                requisito de Facebook Login de tener una politica de
                privacidad visible). */}
            <Route path="/privacidad" element={<PoliticaPrivacidadPage />} />
            <Route path="/terminos" element={<TerminosServicioPage />} />

            {/* RUTAS PROTEGIDAS - cada una envuelta en ProtectedRoute */}

            {/* Ruta /home que faltaba registrar */}
            <Route path="/home" element={<HomePage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/materias"
              element={
                <ProtectedRoute>
                  <MateriasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tareas"
              element={
                <ProtectedRoute>
                  <TareasPage />
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

            {/* Raiz redirige al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;