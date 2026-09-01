// Configuracion de TailwindCSS para Academix.
// Le digo a Tailwind donde estan mis archivos para que detecte
// las clases que uso y genere solo el CSS necesario (purge automatico).

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Activo el modo oscuro por clase: cuando <html> tiene la clase "dark",
  // se aplican todas las variantes "dark:". Yo controlo esa clase desde
  // el hook useTema().
  darkMode: 'class',
  theme: {
    extend: {
      // Aqui defino mi paleta de colores personalizada para Academix.
      // En lugar de usar colores genericos, creo un "brand" coherente
      // que dara identidad visual a la aplicacion.
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      // Tipografia Inter por defecto: moderna y muy legible.
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}