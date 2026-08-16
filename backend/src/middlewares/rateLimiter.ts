// Protejo los endpoints sensibles de auth contra ataques de fuerza bruta.
// Sin esto, alguien puede intentar millones de contraseñas sin freno.
// express-rate-limit bloquea una IP si hace demasiadas peticiones en poco tiempo.

import rateLimit from 'express-rate-limit';

// Límite para login: máximo 10 intentos por IP en 15 minutos.
// Si alguien falla 10 veces, lo bloqueo 15 minutos. Suficiente para
// disuadir fuerza bruta sin molestar a usuarios reales que se equivocan.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máximo 10 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,  // devuelve info en headers RateLimit-*
  legacyHeaders: false,
});

// Límite para registro: máximo 5 registros por IP en 1 hora.
// Evita que alguien cree cientos de cuentas en segundos.
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: {
    success: false,
    message: 'Demasiadas cuentas creadas desde esta IP. Intenta de nuevo en 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});