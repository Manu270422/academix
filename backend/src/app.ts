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
import remindersRoutes from './modules/reminders/reminders.routes';

const app: Application = express();

// Le digo a Express que confíe en el proxy de Render (1 salto).
// Sin esto, express-rate-limit lanza un error al ver la cabecera
// X-Forwarded-For que Render agrega, y la petición se cae antes
// de responder.
app.set('trust proxy', 1);

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

app.use(helmet());

app.use(
  cors({
    // En vez de una lista fija, uso una función. Esto es necesario porque
    // Vercel genera una URL nueva y distinta para cada deploy de preview
    // (ej. academix-5vjakin5c-el-mundo-de-manu.vercel.app), y esa URL
    // cambia en cada push. Con una lista fija tocaria actualizar
    // CORS_ORIGINS en Render cada vez. Con esta funcion, cualquier
    // subdominio de mi proyecto en Vercel (terminado en
    // "-el-mundo-de-manu.vercel.app") queda permitido automaticamente,
    // ademas de los origenes explicitos en CORS_ORIGINS (localhost y
    // el dominio de produccion).
    origin: (origin, callback) => {
      // Peticiones sin origin (ej. curl, apps moviles, Postman) se permiten.
      if (!origin) return callback(null, true);

      const esOrigenPermitidoFijo = env.corsOrigins.includes(origin);
      const esPreviewDeVercel = /^https:\/\/academix-[\w-]+-el-mundo-de-manu\.vercel\.app$/.test(
        origin
      );

      if (esOrigenPermitidoFijo || esPreviewDeVercel) {
        return callback(null, true);
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
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
app.use('/api/v1/reminders', remindersRoutes);

// ============================================================
// MANEJO DE ERRORES (siempre al final)
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

logger.info('Aplicación Express configurada correctamente');

export default app;