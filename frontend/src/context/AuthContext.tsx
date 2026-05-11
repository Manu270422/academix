// ============================================================
// PROVIDER DE AUTENTICACION
// ============================================================
// Componente que envuelve la app y proporciona el contexto de sesión
// a todos sus hijos.
//
// Responsabilidades:
//   - Mantener los datos del usuario autenticado.
//   - Permitir login/logout/register/updateUserData.
//   - Verificar la sesión al cargar la app (preguntando a /auth/me).
//
// El hook useAuth vive en hooks/useAuth.ts.
// El tipo y el createContext viven en AuthContext.ts.
// ============================================================

import { useEffect, useState, type ReactNode } from 'react';
import * as authService from '../api/auth.service';
import { tokenStorage } from '../api/client';
import type { Usuario, LoginCredentials, RegisterData } from '../types';
import { AuthContext, type AuthContextValue } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // VERIFICACION DE SESION AL CARGAR LA APP
  // ============================================================
  // Cuando el usuario abre la app, no se si su sesión sigue activa.
  // Si tengo un token guardado en localStorage, pregunto a /auth/me.
  // Si responde 200, la sesión es valida -> guardo el usuario.
  // Si responde 401, el interceptor intenta refresh; si falla, limpia.
  useEffect(() => {
    async function verifySession() {
      const token = tokenStorage.getAccessToken();

      if (!token) {
        // No hay token, no hay sesión.
        setIsLoading(false);
        return;
      }

      try {
        const usuarioActual = await authService.getMe();
        setUsuario(usuarioActual);
      } catch {
        // El token es inválido o expiró y el refresh también fallo.
        // El interceptor ya limpio los tokens, asi que solo dejo el estado en null.
        setUsuario(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  // ============================================================
  // FUNCIONES PUBLICAS DEL CONTEXTO
  // ============================================================

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await authService.login(credentials);
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    setUsuario(response.usuario);
  }

  async function register(data: RegisterData): Promise<void> {
    const response = await authService.register(data);
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    setUsuario(response.usuario);
  }

  function logout(): void {
    tokenStorage.clear();
    setUsuario(null);
  }

  // Actualiza el usuario en el contexto sin tener que recargar.
  // Lo llamo despues de editar el perfil para que la sidebar y demás
  // componentes muestren el nombre nuevo inmediatamente.
  function updateUserData(usuarioActualizado: Usuario): void {
    setUsuario(usuarioActualizado);
  }

  // Construyo el valor del contexto.
  // isAuthenticated lo derivo de usuario para no tener dos fuentes de verdad.
  const value: AuthContextValue = {
    usuario,
    isAuthenticated: usuario !== null,
    isLoading,
    login,
    register,
    logout,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}