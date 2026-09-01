// Configuracion de Vite para Academix.
// Vite es el bundler y servidor de desarrollo.
// (La configuración de los tests vive aparte, en vitest.config.ts.)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // ============================================================
    // PWA: Academix instalable en el móvil
    // ============================================================
    // Yo hago que Academix se pueda "Añadir a la pantalla de inicio"
    // y funcione sin conexión para consultar lo ya cargado.
    //
    //   - registerType 'autoUpdate': cuando publico una versión nueva,
    //     el service worker se actualiza solo en la siguiente visita.
    //   - manifest: los datos que usa el móvil para el icono y el
    //     nombre de la app instalada.
    //   - workbox.importScripts: mi service worker de notificaciones
    //     push (public/push-sw.js) se "engancha" al service worker que
    //     genera el plugin, así uno solo hace las dos cosas: caché
    //     offline + recibir notificaciones.
    //   - workbox.runtimeCaching: cacheo las respuestas GET de mi API
    //     con estrategia "network-first" -> si hay internet trae lo
    //     fresco; si no, muestra lo último que guardó.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Academix - Gestor Académico',
        short_name: 'Academix',
        description:
          'Organiza tus materias, tareas y fechas de entrega en un solo lugar.',
        lang: 'es',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/dashboard',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        importScripts: ['push-sw.js'],
        // No intento servir index.html cuando alguien pide algo de /api.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Mi API (api.academix.elmundodemanu.com). Network-first:
            // intento la red 5s y, si falla, uso la copia cacheada.
            urlPattern: ({ url }) =>
              url.hostname === 'api.academix.elmundodemanu.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'academix-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Dejo el PWA activo también en "npm run dev" para probarlo
        // sin hacer build.
        enabled: true,
        // En dev el fallback de navegación usa index.html.
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: {
    // Puerto del servidor de desarrollo.
    // 5173 es el default de Vite y es el que tengo en CORS_ORIGINS del backend.
    port: 5173,
    // Abre el navegador automaticamente al correr "npm run dev".
    open: true,
  },
});
