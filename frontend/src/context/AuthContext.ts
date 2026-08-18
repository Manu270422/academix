// ============================================================
// DEFINICION DEL CONTEXTO Y SU TIPO
// ============================================================
// Este archivo lo separo a proposito de AuthContext.tsx para que
// Vite pueda hacer "Fast Refresh" sin problemas. La regla es que
// un archivo solo debe exportar componentes O cosas que no son
// componentes, pero no mezclarlas.
//
// Aqui solo defino: el tipo del contexto y el createContext.
// El hook useAuth vive en hooks/useAuth.ts.
// El componente AuthProvider vive en AuthContext.tsx.
// ============================================================

import { createContext } from 'react';
import type { Usuario, LoginCredentials, RegisterData } from '../types';

export interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  // Login (o registro automatico) con el "credential" que devuelve
  // el boton de Google Identity Services.
  loginConGoogle: (credential: string) => Promise<void>;
  // Login (o registro automatico) con el accessToken que devuelve
  // el SDK de Facebook.
  loginConFacebook: (accessToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  // Actualiza el usuario del contexto sin recargar.
  // Lo uso despues de cambiar el perfil para reflejar el nuevo nombre
  // en la sidebar y demás componentes inmediatamente.
  updateUserData: (usuario: Usuario) => void;
}

// Creo el contexto con valor por defecto undefined.
// Asi si alguien intenta usarlo fuera del Provider, el hook useAuth
// lanza un error claro en lugar de devolver datos invalidos silenciosamente.
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

// Re-exporto AuthProvider desde aqui para que cualquier import como
// "from './context/AuthContext'" funcione, sin importar si TypeScript
// resuelve este archivo (.ts) o el otro (.tsx).
// Asi App.tsx no tiene que preocuparse de cual archivo cargar.
export { AuthProvider } from './AuthContext.tsx';