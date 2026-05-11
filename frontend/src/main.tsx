// ============================================================
// PUNTO DE ENTRADA DEL FRONTEND
// ============================================================
// Este archivo es el "main" de mi aplicación React.
// Su unica responsabilidad es montar el componente App en el DOM.
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode activa chequeos extra de React en desarrollo.
// No afecta producción, pero me ayuda a detectar bugs comunes
// como efectos sin cleanup, deprecated APIs, etc.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);