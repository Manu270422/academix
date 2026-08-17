// Aquí centralizo toda la configuración del proyecto.
// La idea es leer las variables de entorno UNA sola vez, validarlas,
// y exportarlas tipadas para usarlas en todo el proyecto.
// Si algo falta, el servidor falla al arrancar (mejor fallar temprano que tarde).

import dotenv from 'dotenv';

// Cargo el archivo .env en process.env
dotenv.config();

// Función auxiliar: si la variable no existe, lanza un error claro.
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
  return value;
}

// Función auxiliar para variables numéricas.
function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];

  // Trato "" igual que undefined: Number('') da 0 (no NaN), y un puerto 0
  // hace que Node escuche en un puerto aleatorio distinto en cada arranque.
  if (value === undefined || value.trim() === '') {
    if (defaultValue === undefined) {
      throw new Error(`Falta la variable de entorno requerida: ${key}`);
    }
    return defaultValue;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`La variable de entorno ${key} debe ser un número`);
  }

  return parsed;
}

// Aquí exporto un objeto con toda la configuración, ya tipado.
export const env = {
  port: getEnvNumber('PORT', 3000),
  nodeEnv: getEnv('NODE_ENV', 'development'),

  databaseUrl: getEnv('DATABASE_URL', 'mysql://root:@localhost:3306/academix'),

  jwt: {
    accessSecret: getEnv('JWT_ACCESS_SECRET', 'dev_access_secret'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
    accessExpiresIn: getEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  // Convierto la cadena "url1,url2,url3" en un array, util para CORS.
  corsOrigins: getEnv('CORS_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },
};