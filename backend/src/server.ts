// Este es el punto de entrada de mi backend.
// Su unica responsabilidad es: tomar la app de Express ya configurada
// y ponerla a escuchar en un puerto.

import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './config/database';

async function startServer(): Promise<void> {
  // 1. Primero verifico que la base de datos responde.
  await connectDatabase();

  // 2. Una vez conectada la BD, arranco el servidor HTTP.
  const server = app.listen(env.port, () => {
    logger.info(`Servidor escuchando en http://localhost:${env.port}`);
    logger.info(`Ambiente: ${env.nodeEnv}`);
  });

  // ============================================================
  // MANEJO DE ERRORES A NIVEL DE PROCESO
  // ============================================================
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Senal ${signal} recibida. Cerrando servidor...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Servidor cerrado correctamente');
      process.exit(0);
    });
  };

  process.on('uncaughtException', (error: Error) => {
    logger.error('ExcepciÓn no capturada:', error);
    server.close(() => process.exit(1));
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Promesa rechazada sin manejar:', reason);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

startServer().catch((error) => {
  logger.error('Error fatal al arrancar el servidor:', error);
  process.exit(1);
});