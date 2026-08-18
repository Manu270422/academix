// ============================================================
// PÁGINA: POLÍTICA DE PRIVACIDAD
// ============================================================
// Pagina publica y estatica. La necesito para cumplir el requisito
// de Meta (Facebook Login) de tener una politica de privacidad
// visible, y tambien es buena practica general para cualquier app
// que maneje datos de usuarios.
// ============================================================

export function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Política de Privacidad de Academix
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Última actualización: 18 de agosto de 2026
        </p>

        <div className="mt-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Qué información recopilamos
            </h2>
            <p className="mt-2">
              Cuando usas Academix, guardamos: tu nombre y correo
              electrónico (ya sea porque los ingresas directamente al
              registrarte, o porque nos los entrega un proveedor de
              inicio de sesión como Google, Microsoft o Facebook cuando
              elijes esa opción); las materias y tareas académicas que
              registras dentro de la aplicación; y, si activas las
              notificaciones del navegador, una suscripción técnica
              que nos permite enviarte esos avisos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. Para qué usamos tu información
            </h2>
            <p className="mt-2">
              Usamos tus datos únicamente para el funcionamiento del
              servicio: mostrarte tus materias y tareas, identificarte
              al iniciar sesión, y enviarte recordatorios sobre tus
              fechas de entrega por correo electrónico o notificación
              del navegador. No vendemos ni compartimos tu información
              con fines publicitarios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. Con quién compartimos información
            </h2>
            <p className="mt-2">
              Para poder enviarte los recordatorios, tu nombre y correo
              se comparten con Resend (nuestro proveedor de envío de
              correos electrónicos) y, si activaste las notificaciones
              del navegador, con el servicio de notificaciones push del
              navegador que uses (Chrome, Firefox, etc., a través del
              estándar Web Push). Estos proveedores solo reciben lo
              mínimo necesario para cumplir esa función.
            </p>
            <p className="mt-2">
              Si inicias sesión con Google, Microsoft o Facebook,
              recibimos de ellos tu nombre, correo electrónico y un
              identificador único de tu cuenta, nunca tu contraseña de
              esas plataformas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Cómo protegemos tu información
            </h2>
            <p className="mt-2">
              Las contraseñas se guardan siempre cifradas (nunca en
              texto plano). Toda la comunicación entre tu navegador y
              nuestros servidores viaja cifrada mediante HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. Tus derechos sobre tu información
            </h2>
            <p className="mt-2">
              Puedes editar tu nombre en cualquier momento desde tu
              perfil. Si quieres que eliminemos tu cuenta y todos los
              datos asociados (materias, tareas, recordatorios), puedes
              escribirnos solicitando la eliminación a{' '}<a href="mailto:contacto@elmundodemanu.com" className="text-brand-600 hover:underline">contacto@elmundodemanu.com</a>, y procesaremos tu solicitud en un plazo razonable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              6. Contacto
            </h2>
            <p className="mt-2">
              Si tienes preguntas sobre esta política, escríbenos a{' '}<a href="mailto:contacto@elmundodemanu.com" className="text-brand-600 hover:underline">contacto@elmundodemanu.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}