// ============================================================
// VERIFICACION DE TOKENS DE FACEBOOK
// ============================================================
// A diferencia de Google (que verifica el token localmente con una
// libreria), con Facebook hago 2 llamadas a la Graph API de Meta:
//   1. "debug_token": confirma que el access token es real, valido,
//      y que fue generado para MI app (no para otra).
//   2. "/me": una vez confirmado, pido el nombre/correo del usuario.
//
// Uso el "fetch" nativo de Node (disponible desde Node 18), asi no
// necesito instalar ninguna libreria nueva para esto.
// ============================================================

import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';

interface DatosUsuarioFacebook {
  id: string;
  nombre: string;
  email: string | null;
}

interface RespuestaDebugToken {
  data: {
    is_valid: boolean;
    app_id: string;
    user_id: string;
  };
}

interface RespuestaMe {
  id: string;
  name: string;
  email?: string;
}

/**
 * Verifica el access token que manda el frontend, y si es valido,
 * devuelve los datos basicos del usuario de Facebook.
 */
export async function verificarTokenFacebook(
  accessToken: string
): Promise<DatosUsuarioFacebook> {
  if (!env.facebookAppId || !env.facebookAppSecret) {
    throw new AppError('El login con Facebook no está configurado', 500);
  }

  // El "app access token" es simplemente APP_ID|APP_SECRET. Lo uso
  // para autorizar la llamada a debug_token (Meta exige que quien
  // pregunta "es valido este token?" se identifique como la app).
  const appAccessToken = `${env.facebookAppId}|${env.facebookAppSecret}`;

  // PASO 1: verifico que el token sea real y le pertenezca a MI app.
  const debugUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`;

  const debugResponse = await fetch(debugUrl);
  if (!debugResponse.ok) {
    throw new AppError('El token de Facebook no es válido', 401);
  }

  const debugData = (await debugResponse.json()) as RespuestaDebugToken;

  if (!debugData.data.is_valid || debugData.data.app_id !== env.facebookAppId) {
    throw new AppError('El token de Facebook no es válido', 401);
  }

  // PASO 2: ya confirmado que es real, pido los datos del usuario.
  const meUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
  const meResponse = await fetch(meUrl);

  if (!meResponse.ok) {
    throw new AppError('No se pudo obtener el perfil de Facebook', 401);
  }

  const meData = (await meResponse.json()) as RespuestaMe;

  return {
    id: meData.id,
    nombre: meData.name,
    // Facebook puede NO devolver el correo si el usuario no lo tiene
    // verificado en su cuenta, o si no dio el permiso. Lo manejo como
    // null y en auth.service.ts decido que hacer en ese caso.
    email: meData.email ?? null,
  };
}