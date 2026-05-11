// ============================================================
// CLIENTE DE PRISMA CENTRALIZADO
// ============================================================
// Aquí creo UNA SOLA instancia de PrismaClient para todo el proyecto.
// Si la creo varias veces, abriria muchas conexiones a la base de datos
// y eventualmente la saturaria. A esto se le llama patrón "singleton".
//
// Además, en desarrollo ts-node-dev recarga el código cada vez que guardo,
// así que sin esta lógica especial se crearían conexiones nuevas en cada
// recarga hasta agotar el límite de MySQL. El truco del "globalThis" lo evita.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

// En desarrollo guardo la instancia en una variable global de Node.
declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

// Si ya existe una instancia global la reuso, si no creo una nueva.
export const prisma =
  global.prismaInstance ??
  new PrismaClient({
    log: env.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
  });

// Solo en desarrollo guardo la instancia globalmente (truco de hot-reload).
if (env.isDevelopment) {
  global.prismaInstance = prisma;
}

// ============================================================
// FUNCION PARA PROBAR LA CONEXIÓN
// ============================================================
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Conexión a la base de datos establecida correctamente');
  } catch (error) {
    logger.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

// ============================================================
// FUNCION PARA CERRAR LA CONEXIÓN
// ============================================================
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Conexión a la base de datos cerrada');
}