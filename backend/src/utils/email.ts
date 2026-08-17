// Aqui centralizo el envio de correos con Resend.
// Aislo toda la logica de "quien es el proveedor" en este solo archivo:
// si el dia de manana cambio de Resend a otro servicio (por escala o
// por costo), solo toco este archivo, nada mas en el proyecto se entera.

import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from './logger';

const resend = new Resend(env.resendApiKey);

interface CorreoRecordatorio {
  destinatario: string;
  nombreEstudiante: string;
  tituloTarea: string;
  nombreMateria: string;
  fechaEntrega: Date;
}

// Resultado del envio: no solo si funciono, tambien el mensaje de error
// si fallo, para poder guardarlo en el campo ultimoError del recordatorio
// (asi puedo revisar despues por que fallaron los reintentos).
export interface ResultadoEnvioCorreo {
  exito: boolean;
  error?: string;
}

// Envio el correo de recordatorio de una tarea proxima a vencer.
// Si Resend no esta configurado (falta la API key), no revienta el
// servidor: solo lo registro en el log y sigo, para que en desarrollo
// local no sea obligatorio tener la clave.
export async function enviarCorreoRecordatorio(
  datos: CorreoRecordatorio
): Promise<ResultadoEnvioCorreo> {
  if (!env.resendApiKey) {
    const mensaje =
      'RESEND_API_KEY no configurada: se omite el envio de correo de recordatorio';
    logger.warn(mensaje);
    return { exito: false, error: mensaje };
  }

  const fechaFormateada = datos.fechaEntrega.toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  });

  try {
    const { error } = await resend.emails.send({
      from: env.resendFromEmail,
      to: datos.destinatario,
      subject: `Recordatorio: "${datos.tituloTarea}" vence pronto`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Academix</h2>
          <p>Hola ${datos.nombreEstudiante},</p>
          <p>Tu tarea <strong>"${datos.tituloTarea}"</strong> de la materia
          <strong>${datos.nombreMateria}</strong> esta por vencer.</p>
          <p><strong>Fecha de entrega:</strong> ${fechaFormateada}</p>
          <p>Entra a Academix para revisarla.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 12px;">
            Academix - Tu gestor academico personal
          </p>
        </div>
      `,
    });

    if (error) {
      logger.error(`Error enviando correo de recordatorio: ${error.message}`);
      return { exito: false, error: error.message };
    }

    return { exito: true };
  } catch (error) {
    const mensaje = (error as Error).message;
    logger.error(`Excepcion enviando correo de recordatorio: ${mensaje}`);
    return { exito: false, error: mensaje };
  }
}