// ============================================================
// PÁGINA: TÉRMINOS DE SERVICIO
// ============================================================
// Pagina publica y estatica, complementaria a la de privacidad.
// ============================================================

export function TerminosServicioPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Términos de Servicio de Academix
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Última actualización: 18 de agosto de 2026
        </p>

        <div className="mt-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Qué es Academix
            </h2>
            <p className="mt-2">
              Academix es una herramienta gratuita para que estudiantes
              organicen sus materias y tareas académicas, y reciban
              recordatorios de sus fechas de entrega.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. Uso aceptable
            </h2>
            <p className="mt-2">
              Al usar Academix te comprometes a usar la plataforma de
              forma responsable, sin intentar dañarla, acceder a
              cuentas ajenas, o usarla para fines distintos a la
              gestión de tu propia actividad académica.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. Tu cuenta
            </h2>
            <p className="mt-2">
              Eres responsable de mantener segura tu contraseña (si
              usas registro tradicional). Si inicias sesión con Google,
              Microsoft o Facebook, la seguridad de esa cuenta depende
              de las políticas de esa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Disponibilidad del servicio
            </h2>
            <p className="mt-2">
              Academix es un proyecto en desarrollo continuo. Hacemos
              nuestro mejor esfuerzo para mantenerlo disponible, pero
              no garantizamos que el servicio esté libre de
              interrupciones en todo momento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. Cambios a estos términos
            </h2>
            <p className="mt-2">
              Podemos actualizar estos términos conforme Academix crece
              y agrega funciones nuevas. Publicaremos la fecha de la
              última actualización en la parte superior de esta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              6. Contacto
            </h2>
            <p className="mt-2">
              Si tienes preguntas sobre estos términos, escríbenos a{' '}<a href="mailto:contacto@elmundodemanu.com" className="text-brand-600 hover:underline">contacto@elmundodemanu.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}