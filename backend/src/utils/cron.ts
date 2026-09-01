// Aqui programo las tareas automaticas del servidor (cron jobs).
// Por ahora solo tengo una: revisar cada 15 minutos si hay
// recordatorios de tareas que ya toca enviar.

import cron from 'node-cron';
import { procesarRecordatoriosPendientes } from '../modules/reminders/reminders.service';
import { purgarAntiguos } from '../modules/trash/trash.service';
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

  // Todos los dias a las 03:00: borro definitivamente lo que lleve
  // mas de 30 dias en la papelera.
  cron.schedule('0 3 * * *', async () => {
    try {
      await purgarAntiguos(30);
    } catch (error) {
      logger.error(
        `Error purgando la papelera: ${(error as Error).message}`
      );
    }
  });

  logger.info(
    'Cron programado: recordatorios (cada 15 min) + purga de papelera (diaria)'
  );
}