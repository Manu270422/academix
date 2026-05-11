// Hago un logger sencillo en lugar de usar console.log directamente.
// La razón es que si mañana quiero cambiarlo por una libreria mas potente
// (como Winston o Pino), solo modifico este archivo y no tengo que tocar
// nada más en el proyecto. Esto se llama "principio de inversión de dependencias".

import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  info(message: string, ...args: unknown[]): void {
    console.log(formatMessage('info', message), ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(formatMessage('warn', message), ...args);
  },

  error(message: string, ...args: unknown[]): void {
    console.error(formatMessage('error', message), ...args);
  },

  // El debug solo se imprime en desarrollo, para no llenar logs en producción.
  debug(message: string, ...args: unknown[]): void {
    if (env.isDevelopment) {
      console.debug(formatMessage('debug', message), ...args);
    }
  },
};