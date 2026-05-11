// Aqui construyo la aplicación Express con toda su configuración.

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Rutas de los módulos
import authRoutes from './modules/auth/auth.routes';
import subjectsRoutes from './modules/subjects/subjects.routes';
import tasksRoutes from './modules/tasks/tasks.routes';

const app: Application = express();

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================
// RUTAS PUBLICAS
// ============================================================

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Academix API funcionando correctamente',
    version: '1.0.0',
    author: 'Carlos Manuel Turizo Hernández',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// RUTAS DE LA API
// ============================================================

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/subjects', subjectsRoutes);
app.use('/api/v1/tasks', tasksRoutes);

// ============================================================
// MANEJO DE ERRORES (siempre al final)
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

logger.info('Aplicación Express configurada correctamente');

export default app;