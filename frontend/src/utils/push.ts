// ============================================================
// UTILIDADES PARA NOTIFICACIONES PUSH (LADO DEL NAVEGADOR)
// ============================================================
// Aqui vive toda la logica de bajo nivel para activar las
// notificaciones push: registrar el service worker, pedir permiso,
// y suscribirse al servicio de push del navegador.
// ============================================================

// Verifico si el navegador soporta push (Safari viejo, por ejemplo,
// no lo soporta completamente).
export function soportaPush(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Registro el service worker. Ahora Academix tiene UN solo service
// worker: el que genera vite-plugin-pwa en /sw.js, que ademas hace
// importScripts('/push-sw.js') para manejar las notificaciones push
// (ver vite.config.ts). Al ser PWA, el plugin ya lo registra al
// cargar la app; aqui solo espero a que este listo y devuelvo su
// registro para poder suscribirme.
export async function registrarServiceWorker(): Promise<ServiceWorkerRegistration> {
  const existente = await navigator.serviceWorker.getRegistration('/');
  if (existente) return existente;
  return navigator.serviceWorker.register('/sw.js', { type: 'classic' });
}

// El navegador exige que la VAPID public key este en formato
// Uint8Array, pero mi backend me la da como string base64. Esta
// funcion hace esa conversion (es el codigo estandar que recomienda
// la documentacion de Web Push).
//
// NOTA: construyo el Uint8Array a partir de un ArrayBuffer explicito
// (en vez de new Uint8Array(largo) directo) porque en versiones
// nuevas de TypeScript el tipo inferido queda como
// Uint8Array<ArrayBufferLike> (que incluye SharedArrayBuffer) y
// pushManager.subscribe() exige especificamente un ArrayBuffer
// normal. Asi evito el choque de tipos.
function convertirVapidKey(claveBase64: string): BufferSource {
  const relleno = '='.repeat((4 - (claveBase64.length % 4)) % 4);
  const base64 = (claveBase64 + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const bruto = window.atob(base64);

  const buffer = new ArrayBuffer(bruto.length);
  const salida = new Uint8Array(buffer);
  for (let i = 0; i < bruto.length; i++) {
    salida[i] = bruto.charCodeAt(i);
  }
  return salida;
}

// Reviso si el navegador YA tiene una suscripcion push activa
// (por si el estudiante ya la activo antes, en una sesion pasada).
export async function obtenerSuscripcionActual(
  registro: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  return registro.pushManager.getSubscription();
}

// Crea una suscripcion push nueva. Esto es lo que dispara el popup
// del navegador pidiendole permiso al estudiante.
export async function crearSuscripcionPush(
  registro: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription> {
  return registro.pushManager.subscribe({
    userVisibleOnly: true, // exigido por el estandar: toda push debe mostrar algo visible
    applicationServerKey: convertirVapidKey(vapidPublicKey),
  });
}