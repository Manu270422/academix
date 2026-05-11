// ============================================================
// MIDDLEWARE DE VALIDACIÓN CON ZOD
// ============================================================
// Este middleware me permite validar los datos que llegan en una petición
// (body, params, query) usando esquemas de Zod.
//
// ¿Por qué es tan importante? Porque NUNCA debo confiar en lo que envia
// el cliente. Un atacante podría mandar tipos incorrectos, campos extra,
// inyecciones, etc. Si valido aqui, el resto del código trabaja con datos
// que SÉ que tienen la forma correcta.
//
// La gracia es que es genérico: lo uso en cualquier ruta pasandole
// el esquema correspondiente (registro, login, crear materia, etc.).
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

// Defino que partes del request voy a poder validar.
type ValidationSource = 'body' | 'params' | 'query';

/**
 * Middleware que valida una parte del request contra un esquema Zod.
 * Si la validación falla, responde con 422 (Unprocessable Entity).
 * Si pasa, reemplaza la propiedad del request con los datos ya parseados
 * y tipados, y continua al siguiente middleware.
 *
 * @param schema  Esquema de Zod que define la forma esperada de los datos.
 * @param source  De donde tomo los datos: 'body' (default), 'params' o 'query'.
 */
export function validate(schema: ZodSchema, source: ValidationSource = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Zod hace dos cosas a la vez: valida Y devuelve los datos parseados.
      // Si algo falla, lanza ZodError que capturo abajo.
      const data = schema.parse(req[source]);

      // Reemplazo los datos originales por los parseados.
      // Asi el resto del código trabaja con datos limpios y tipados.
      req[source] = data;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Construyo una respuesta de error clara que indique
        // exactamente que campo falló y por qué.
        const errors = error.errors.map((err) => ({
          campo: err.path.join('.'),
          mensaje: err.message,
        }));

        res.status(422).json({
          success: false,
          message: 'Los datos enviados no son válidos',
          errors,
        });
        return;
      }

      // Si es otro tipo de error inesperado, lo paso al errorHandler central.
      next(error);
    }
  };
}