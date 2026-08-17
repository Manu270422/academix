// Aqui programo las tareas automaticas del servidor (cron jobs).
// Por ahora solo tengo una: revisar cada 15 minutos si hay
// recordatorios de tareas que ya toca enviar.

import cron from 'node-cron';
import { procesarRecordatoriosPendientes } from '../modules/reminders/reminders.service';
import { logger } from './logger';

export function iniciarCronJobs(): void {
  // Expresion "*/15 * * * *" = cada 15 minutos.
  // No hace falta mas frecuencia: los recordatorios se calculan en
  // horas, un margen de hasta 15 minutos no afecta al estudiante.
  cron.schedule('*/15 * * * *', async () => {
    try {
      await procesarRecordatoriosPendientes();
    } catch (error) {
      logger.error(
        `Error procesando recordatorios pendientes: ${(error as Error).message}`
      );
    }
  });

  logger.info('Cron de recordatorios programado (cada 15 minutos)');
}