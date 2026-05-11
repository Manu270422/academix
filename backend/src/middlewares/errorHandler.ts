// Este middleware se encarga de capturar TODOS los errores que ocurran
// en el backend y devolver una respuesta consistente al cliente.

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Defino una clase de error personalizada para errores que YO lanzo a proposito.
// Por ejemplo: "usuario no encontrado" (404), "credenciales invÁlidas" (401), etc.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware para rutas que no existen (404).
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

// Middleware principal de manejo de errores.
// Express lo reconoce porque tiene 4 parametros (err, req, res, next).
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError;

  if (isOperational) {
    logger.warn(`AppError ${statusCode}: ${err.message}`);
  } else {
    logger.error(`Error inesperado en ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Error interno del servidor',
    ...(env.isDevelopment && !isOperational && { stack: err.stack }),
  });
}