// ============================================================
// SERVICE WORKER DE ACADEMIX
// ============================================================
// Este script vive "afuera" de mi app de React, en segundo plano,
// incluso con la pestana de Academix cerrada. Su unico trabajo es
// escuchar cuando llega una notificacion push desde mi backend y
// mostrarla en la barra del sistema / pantalla de bloqueo.
// ============================================================

self.addEventListener('push', (evento) => {
  // El backend me manda el contenido como JSON (ver utils/push.ts
  // del backend): { title, body, url }.
  const datos = evento.data ? evento.data.json() : {};

  const titulo = datos.title || 'Academix';
  const opciones = {
    body: datos.body || 'Tienes una notificacion nueva.',
    icon: '/icons.svg',
    badge: '/icons.svg',
    data: { url: datos.url || '/' },
  };

  evento.waitUntil(self.registration.showNotification(titulo, opciones));
});

// Cuando el estudiante hace click en la notificacion, lo llevo a
// Academix (o enfoco la pestana si ya la tiene abierta).
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();

  const url = evento.notification.data?.url || '/';

  evento.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((listaClientes) => {
      for (const cliente of listaClientes) {
        if (cliente.url.includes(self.location.origin) && 'focus' in cliente) {
          return cliente.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});