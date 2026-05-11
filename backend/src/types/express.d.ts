// ============================================================
// EXTENSIÓN DE TIPOS DE EXPRESS
// ============================================================
// TypeScript no sabe que "req.user" existe en una petición HTTP de Express
// porque ese campo lo voy a anadir YO desde el middleware de autenticación.
//
// Aquí le digo a TypeScript: "oye, el objeto Request de Express ahora tiene
// una propiedad opcional llamada user con esta forma".
//
// Esto se llama "module augmentation": estoy ampliando un modulo existente
// (express-serve-static-core) para anadirle nuevas propiedades.
// ============================================================

// Defino la forma de los datos del usuario autenticado.
// Solo guardo lo MÍNIMO necesario: id y email. No quiero meter el objeto
// usuario completo porque el JWT solo carga esos dos campos en su payload.
export interface AuthUser {
  id: number;
  email: string;
}

// Aquí hago la "magia": extiendo el namespace de Express para que
// la propiedad "user" exista en cualquier objeto Request del proyecto.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      // Es opcional (con ?) porque solo existe DESPUÉS de pasar por el
      // middleware de autenticación. En rutas publicas no estara presente.
      user?: AuthUser;
    }
  }
}

// Necesito al menos un export para que TypeScript trate este archivo
// como un módulo y no como un script. Sin esto, "declare global" no funciona.
export {};