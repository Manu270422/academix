// ============================================================
// COMPONENTE: RUTA PROTEGIDA
// ============================================================
// Envuelve a las paginas que solo deben verse si el usuario esta logueado.
// Si la sesión no está verificada todavía, muestra un loader.
// Si no hay sesión, redirige al login.
// Si hay sesión, deja ver el contenido protegido.
//
// Uso:
//   <ProtectedRoute>
//     <Dashboard />
//   </ProtectedRoute>
// ============================================================

import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';


interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras se verifica la sesion, muestro un loader simple.
  // Sin esto, habria un parpadeo de "no autenticado" antes de cargar.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si la verificacion termino y NO hay sesion, mando al login.
  // El "replace" evita que el usuario pueda volver con el boton "atras".
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Sesión valida: muestro el contenido protegido.
  return <>{children}</>;
}