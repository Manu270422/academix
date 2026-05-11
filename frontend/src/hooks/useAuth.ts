// ============================================================
// HOOK PERSONALIZADO: useAuth
// ============================================================
// Encapsula el useContext con manejo de errores claro.
// Asi en mis componentes uso "const { usuario } = useAuth()" en lugar
// de "const { usuario } = useContext(AuthContext) ?? {}".
//
// Lo separo en su propio archivo porque mezclar hooks con componentes
// en el mismo archivo rompe el Fast Refresh de Vite.
// ============================================================

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/AuthContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}