// PostCSS procesa el CSS antes de servirlo.
// Los dos plugins clave son:
//   - tailwindcss: convierte mis clases de Tailwind en CSS real.
//   - autoprefixer: anade prefijos de navegadores (-webkit-, -moz-, etc.)
//                   para que mi CSS funcione en navegadores antiguos.

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}