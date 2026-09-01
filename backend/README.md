<div align="center">

# 🎓 Academix — Backend

### API REST para Sistema de Gestión Académica

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

**Desarrollado por Carlos Manuel Turizo Hernández**  
*Tecnólogo en Análisis y Desarrollo de Software — SENA · Barrancabermeja, Colombia 🇨🇴*

[Documentación](#-documentación) · [Instalación](#-instalación) · [API](#-endpoints-de-la-api) · [Contacto](#-contacto)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Arquitectura](#️-arquitectura)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Seguridad](#-seguridad)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Base de Datos](#️-base-de-datos)
- [Despliegue](#-despliegue)
- [Documentación](#-documentación)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🎯 Sobre el Proyecto

**Academix Backend** es una API REST construida con TypeScript y Express que permite a estudiantes gestionar sus materias, tareas y fechas de entrega de forma segura y centralizada. El sistema implementa autenticación JWT con doble token, aislamiento estricto por usuario y validación robusta de datos con Zod.

> **¿Por qué Academix?**  
> Muchos estudiantes enfrentan desorganización académica que afecta su rendimiento. Academix centraliza toda la información en una plataforma segura y accesible desde cualquier dispositivo.

---

## ✨ Características Principales

- 🔐 **Autenticación JWT dual** — access token (15 min) + refresh token (7 días)
- 👤 **Aislamiento por usuario** — cada estudiante accede únicamente a su información
- 📚 **Gestión de materias** — CRUD completo con colores personalizados
- ✅ **Gestión de tareas** — estados (pendiente / en progreso / completada) y prioridades
- 🔍 **Filtros avanzados** — por estado, prioridad, materia y rango de fechas
- ☑️ **Subtareas y notas** — checklist por tarea y apuntes libres por materia
- 🔁 **Repetir tarea** — crea varias entregas de una vez (semanal / quincenal / mensual)
- 🗑️ **Papelera** — borrado suave con restauración y purga automática a los 30 días
- 📦 **Portabilidad** — exportar todos mis datos (JSON) y eliminar cuenta
- 🛡️ **Validación robusta** — esquemas Zod en todos los endpoints
- 🗃️ **Base de datos relacional** — MySQL 8 con Prisma ORM y migraciones versionadas
- 🚀 **TypeScript end-to-end** — tipado fuerte y seguridad en tiempo de desarrollo
- 📊 **Arquitectura en capas** — rutas → controladores → servicios → datos
- 🔒 **Seguridad multicapa** — bcrypt, Helmet, CORS estricto, prevención IDOR
- 🧪 **Con tests** — Vitest + supertest (utilidades, DTOs e integración HTTP), en CI

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20 LTS | Runtime de JavaScript |
| **TypeScript** | 5.6 | Tipado estático |
| **Express** | 4.21 | Framework web |
| **Prisma** | 5.22 | ORM y migraciones |
| **MySQL** | 8.0 | Base de datos relacional |
| **jsonwebtoken** | 9.0 | Autenticación stateless |
| **bcrypt** | 5.1 | Hash de contraseñas |
| **Zod** | 3.23 | Validación de esquemas |

**Librerías adicionales:** `helmet` · `cors` · `morgan` · `dotenv`

---

## 🏗️ Arquitectura

El backend sigue el patrón de **arquitectura en capas** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│          Cliente  (Frontend)            │
└──────────────────┬──────────────────────┘
                   │  HTTP / JSON
┌──────────────────▼──────────────────────┐
│   Capa de Rutas        (Routes)         │  ← Endpoints + Middlewares
├─────────────────────────────────────────┤
│   Capa de Controladores                 │  ← Manejo de Request / Response
├─────────────────────────────────────────┤
│   Capa de Servicios    (Business)       │  ← Lógica de negocio
├─────────────────────────────────────────┤
│   Capa de Datos        (Prisma)         │  ← Queries a la BD
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Base de Datos MySQL           │
└─────────────────────────────────────────┘
```

**Principios aplicados:**
- ✅ Separación de responsabilidades (SoC)
- ✅ Single Responsibility Principle (SRP)
- ✅ DRY — Don't Repeat Yourself
- ✅ Manejo centralizado de errores
- ✅ Inyección de dependencias

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 20 o superior
- MySQL 8.0 o superior
- npm o yarn

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/Manu270422/academix-backend.git
cd academix-backend
```

### Paso 2 — Instalar dependencias

```bash
npm install
```

### Paso 3 — Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores (ver sección [Variables de Entorno](#-variables-de-entorno)).

### Paso 4 — Crear la base de datos

```bash
# Accede a MySQL
mysql -u root -p

# Crea la base de datos
CREATE DATABASE academix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Paso 5 — Aplicar migraciones

```bash
npx prisma migrate dev --name init
```

### Paso 6 — Arrancar el servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm run build && npm start
```

El servidor estará disponible en `http://localhost:3000` 🎉

---

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto a partir de `.env.example`:

```env
# ── Base de datos ──────────────────────────────────────────────
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/academix"

# ── JWT (genera tus propios secretos; ver comando abajo) ───────
JWT_ACCESS_SECRET="tu_secreto_access_muy_seguro"
JWT_REFRESH_SECRET="tu_secreto_refresh_muy_seguro"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# ── Servidor ───────────────────────────────────────────────────
PORT=3000
NODE_ENV="development"

# ── CORS (URL del frontend, separar múltiples con coma) ────────
CORS_ORIGINS="http://localhost:5173"
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Cadena de conexión a MySQL | `mysql://user:pass@localhost:3306/academix` |
| `JWT_ACCESS_SECRET` | Secreto para access tokens | *(ver comando abajo)* |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | *(ver comando abajo)* |
| `JWT_ACCESS_EXPIRES_IN` | Duración del access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh token | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |
| `CORS_ORIGINS` | URLs permitidas (separadas por coma) | `http://localhost:5173` |

**Generar secretos JWT seguros:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia el servidor con hot-reload (nodemon)

# Producción
npm run build            # Compila TypeScript a JavaScript
npm start                # Inicia el servidor compilado

# Prisma
npm run prisma:migrate   # Crea una nueva migración
npm run prisma:studio    # Abre Prisma Studio (UI visual de la BD)
npm run prisma:generate  # Regenera el cliente de Prisma

# Tests
npm test                 # Ejecuta la suite de Vitest una vez
npm run test:watch       # Vitest en modo watch

# Utilidades
npm run type-check       # Verifica tipos sin compilar
npm run lint             # Análisis estático con ESLint
```

---

## 📡 Endpoints de la API

### Base URL

```
http://localhost:3000/api/v1
```

### 🔐 Autenticación

| Método | Endpoint | Descripción | Auth requerida |
|--------|----------|-------------|:--------------:|
| `POST` | `/auth/register` | Registrar nuevo usuario | ✗ |
| `POST` | `/auth/login` | Iniciar sesión | ✗ |
| `POST` | `/auth/refresh` | Renovar access token | Refresh Token |
| `GET` | `/auth/me` | Obtener usuario autenticado | ✓ |
| `PATCH` | `/auth/me` | Actualizar perfil | ✓ |
| `POST` | `/auth/change-password` | Cambiar contraseña | ✓ |
| `GET` | `/auth/me/export` | Descargar todos mis datos (JSON) | ✓ |
| `DELETE` | `/auth/me` | Eliminar mi cuenta y todos mis datos | ✓ |

### 📚 Materias

| Método | Endpoint | Descripción | Auth requerida |
|--------|----------|-------------|:--------------:|
| `POST` | `/subjects` | Crear materia | ✓ |
| `GET` | `/subjects` | Listar materias del usuario | ✓ |
| `GET` | `/subjects/:id` | Ver detalle de una materia (incluye sus notas) | ✓ |
| `PATCH` | `/subjects/:id` | Actualizar materia | ✓ |
| `DELETE` | `/subjects/:id` | Mover materia (y sus tareas) a la papelera | ✓ |
| `POST` | `/subjects/:id/restore` | Restaurar materia desde la papelera | ✓ |
| `DELETE` | `/subjects/:id/permanent` | Borrar materia definitivamente | ✓ |

### 📝 Notas de una materia

| Método | Endpoint | Descripción | Auth requerida |
|--------|----------|-------------|:--------------:|
| `GET` | `/subjects/:materiaId/notes` | Listar apuntes de la materia | ✓ |
| `POST` | `/subjects/:materiaId/notes` | Crear un apunte | ✓ |
| `PATCH` | `/subjects/:materiaId/notes/:id` | Editar un apunte | ✓ |
| `DELETE` | `/subjects/:materiaId/notes/:id` | Eliminar un apunte | ✓ |

### ✅ Tareas

| Método | Endpoint | Descripción | Auth requerida |
|--------|----------|-------------|:--------------:|
| `POST` | `/tasks` | Crear tarea (opcionalmente `repetir` para varias) | ✓ |
| `GET` | `/tasks` | Listar tareas (con filtros, incluye subtareas) | ✓ |
| `GET` | `/tasks/:id` | Ver detalle de una tarea | ✓ |
| `PATCH` | `/tasks/:id` | Actualizar tarea | ✓ |
| `PATCH` | `/tasks/:id/status` | Cambiar estado de tarea | ✓ |
| `DELETE` | `/tasks/:id` | Mover tarea a la papelera | ✓ |
| `POST` | `/tasks/:id/restore` | Restaurar tarea desde la papelera | ✓ |
| `DELETE` | `/tasks/:id/permanent` | Borrar tarea definitivamente | ✓ |

### 🗑️ Papelera

| Método | Endpoint | Descripción | Auth requerida |
|--------|----------|-------------|:--------------:|
| `GET` | `/trash` | Ver materias y tareas en la papelera | ✓ |
| `DELETE` | `/trash` | Vaciar la papelera (borrado definitivo) | ✓ |

> El borrado normal es **suave**: los elementos van a la papelera con
> `deleted_at` y se ocultan de todas las consultas. Un cron los borra de
> verdad a los 30 días.

### ☑️ Subtareas (checklist de una tarea)

| Método | Endpoint | Descripción | Auth requerida |
|--------|----------|-------------|:--------------:|
| `POST` | `/tasks/:tareaId/subtasks` | Añadir un paso | ✓ |
| `PATCH` | `/tasks/:tareaId/subtasks/:id` | Marcar / renombrar / reordenar | ✓ |
| `DELETE` | `/tasks/:tareaId/subtasks/:id` | Quitar un paso | ✓ |

**Filtros disponibles en `GET /tasks`:**

| Parámetro | Valores posibles |
|-----------|-----------------|
| `estado` | `PENDIENTE` · `EN_PROGRESO` · `COMPLETADA` |
| `prioridad` | `BAJA` · `MEDIA` · `ALTA` |
| `materiaId` | ID de la materia |
| `desde` | Fecha inicio (ISO 8601) |
| `hasta` | Fecha fin (ISO 8601) |

### 🏥 Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Información general de la API |
| `GET` | `/health` | Estado del servidor |

### Ejemplo de uso con cURL

```bash
# Registro
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Carlos Turizo", "email": "carlos@example.com", "password": "MiPassword123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "carlos@example.com", "password": "MiPassword123"}'

# Crear materia (requiere token)
curl -X POST http://localhost:3000/api/v1/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"nombre": "Matemáticas IV", "color": "#3B82F6", "descripcion": "Ecuaciones diferenciales"}'
```

---

## 🔒 Seguridad

El backend implementa múltiples capas de seguridad:

### Autenticación
- ✅ **JWT dual-token** — access token (15 min) + refresh token (7 días)
- ✅ **bcrypt con 12 rounds** — contraseñas hasheadas con salt único por usuario
- ✅ **Rotación de refresh tokens** — cada renovación emite un nuevo refresh token

### Autorización
- ✅ **Aislamiento por usuario** — `usuarioId` verificado en cada query
- ✅ **Prevención IDOR** — verificación de propiedad en cada recurso
- ✅ **Respuesta 404 vs 403** — no se revela la existencia de recursos ajenos

### Validación de datos
- ✅ **Zod en todos los endpoints** — validación estricta de tipos y formatos
- ✅ **Límites de longitud** — prevención de DoS por payloads excesivos
- ✅ **Sanitización de entrada** — protección contra inyecciones

### Headers y red
- ✅ **Helmet** — headers de seguridad HTTP automáticos
- ✅ **CORS controlado** — whitelist de orígenes permitidos
- ✅ **HTTPS en producción** — certificados SSL gestionados por la plataforma

### Tabla de mitigaciones

| Vulnerabilidad | Mitigación implementada |
|----------------|-------------------------|
| SQL Injection | Prisma con prepared statements |
| IDOR | Verificación de `usuarioId` en cada query |
| XSS | Escape automático en el frontend (React) |
| CSRF | JWT en header `Authorization` (no en cookies) |
| User Enumeration | Respuestas genéricas en login fallido |
| Brute Force | bcrypt con coste computacional deliberado |

---

## 📁 Estructura del Proyecto

```
academix-backend/
├── prisma/
│   ├── schema.prisma              # Modelo de datos
│   └── migrations/                # Migraciones SQL versionadas
├── src/
│   ├── config/
│   │   ├── env.ts                 # Configuración y validación de variables de entorno
│   │   └── database.ts            # Cliente singleton de Prisma
│   ├── middlewares/
│   │   ├── authenticate.ts        # Middleware de autenticación JWT
│   │   ├── validate.ts            # Middleware de validación con Zod
│   │   └── errorHandler.ts        # Manejo centralizado de errores
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── dto/               # Data Transfer Objects (Zod schemas)
│   │   │   ├── auth.service.ts    # Lógica de negocio
│   │   │   ├── auth.controller.ts # Manejo de Request/Response
│   │   │   └── auth.routes.ts     # Definición de rutas
│   │   ├── subjects/
│   │   │   ├── dto/
│   │   │   ├── subjects.service.ts
│   │   │   ├── subjects.controller.ts
│   │   │   └── subjects.routes.ts
│   │   └── tasks/
│   │       ├── dto/
│   │       ├── tasks.service.ts
│   │       ├── tasks.controller.ts
│   │       └── tasks.routes.ts
│   ├── types/
│   │   └── express.d.ts           # Extensión de tipos globales de Express
│   ├── utils/
│   │   ├── logger.ts              # Logger personalizado
│   │   ├── password.ts            # Utilidades de bcrypt
│   │   └── jwt.ts                 # Utilidades de firma/verificación JWT
│   ├── app.ts                     # Configuración de la aplicación Express
│   └── server.ts                  # Entry point
├── .env.example                   # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Base de Datos

### Modelo Entidad-Relación

```
┌───────────────┐
│    Usuario    │
├───────────────┤
│ id        PK  │
│ email         │
│ nombre        │
│ password      │
│ created_at    │
│ updated_at    │
└───────┬───────┘
        │ 1 : N
        ▼
┌───────────────┐
│    Materia    │
├───────────────┤
│ id        PK  │
│ nombre        │
│ color         │
│ descripcion   │
│ usuario_id FK │
│ created_at    │
│ updated_at    │
└───────┬───────┘
        │ 1 : N
        ▼
┌───────────────┐        ┌───────────────┐
│     Tarea     │        │     Nota      │
├───────────────┤        ├───────────────┤
│ id        PK  │        │ id        PK  │
│ titulo        │        │ contenido     │
│ descripcion   │        │ materia_id FK │
│ fecha_entrega │        │ created_at    │
│ estado        │        │ updated_at    │
│ prioridad     │        └───────────────┘
│ materia_id FK │        (Materia 1 : N Nota)
│ created_at    │
│ updated_at    │
└───────┬───────┘
        │ 1 : N
        ▼
┌───────────────┐
│   Subtarea    │
├───────────────┤
│ id        PK  │
│ titulo        │
│ completada    │
│ orden         │
│ tarea_id  FK  │
│ created_at    │
│ updated_at    │
└───────────────┘
```

> `Tarea` también tiene una relación 1:N con `Recordatorio` (avisos previos al
> vencimiento) y `Usuario` con `PushSubscription` (navegadores suscritos a push).
> El esquema completo está en `prisma/schema.prisma`.

### Gestión de migraciones

```bash
# Crear una nueva migración (desarrollo)
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones en producción
npx prisma migrate deploy

# Ver estado de todas las migraciones
npx prisma migrate status
```

---

## 🚀 Despliegue

### Opción 1 — Render *(recomendado)*

1. Crea una cuenta en [Render](https://render.com) y conecta tu repositorio de GitHub.
2. Configura las variables de entorno en el panel de Render.
3. Render detectará automáticamente el proyecto Node.js.
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`

### Opción 2 — Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Opción 3 — Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### ✅ Checklist pre-despliegue

- [ ] Variables de entorno configuradas en la plataforma
- [ ] Base de datos MySQL creada y accesible
- [ ] Migraciones aplicadas con `prisma migrate deploy`
- [ ] Secretos JWT generados aleatoriamente (no los del `.env.example`)
- [ ] `CORS_ORIGINS` apuntando al dominio del frontend en producción
- [ ] `NODE_ENV` establecido en `production`
- [ ] Logs revisados tras el primer arranque

---

## 📚 Documentación

### Convenciones de código

| Elemento | Convención |
|----------|-----------|
| Archivos `.ts` | `camelCase` |
| Carpetas | `kebab-case` |
| Funciones | `camelCase` |
| Clases | `PascalCase` |
| Constantes globales | `UPPER_SNAKE_CASE` |
| Rutas URL | `kebab-case` |

### Comentarios

El código incluye comentarios explicando decisiones técnicas no obvias, escritos en primera persona para facilitar la lectura y el mantenimiento.

### Testing

La suite usa **Vitest** y **supertest** (`vitest.config.ts`). Cubre lo que **no
necesita base de datos**:

- Utilidades puras: `utils/jwt` (firma/verificación de tokens), `utils/password`
  (hash y comparación con bcrypt).
- Esquemas de validación Zod de cada módulo (`*.dto.ts`).
- Integración HTTP con `supertest` sobre la app en memoria: respuestas que se
  resuelven antes de tocar Prisma (validación `422`, auth `401`, `404`, ruta raíz).
  Los servicios externos (`resend`, `web-push`) se sustituyen por dobles.

```bash
npm test              # Ejecuta todos los tests una vez
npm run test:watch    # Modo watch
```

Se ejecuta en cada push y Pull Request vía GitHub Actions
(`.github/workflows/ci.yml`).

> Los tests de servicios contra una base de datos de pruebas dedicada quedan
> como siguiente paso.

> La cobertura de tests está planificada como próxima fase del proyecto.

---

## 🤝 Contribución

Este es un proyecto académico del programa ADSO — SENA. Las contribuciones son bienvenidas:

1. Haz un fork del repositorio
2. Crea una rama descriptiva: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y haz commit: `git commit -m 'feat: añadir nueva funcionalidad'`
4. Sube la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request describiendo los cambios

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [`LICENSE`](./LICENSE) para más información.

---

## 📞 Contacto

**Carlos Manuel Turizo Hernández**  
*Tecnólogo en Análisis y Desarrollo de Software — SENA*

[![GitHub](https://img.shields.io/badge/GitHub-Manu270422-181717?style=flat-square&logo=github)](https://github.com/Manu270422/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-carlos--manuel--turizo-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/carlos-manuel-turizo-hernández)
[![Email](https://img.shields.io/badge/Email-carlosmanuel.turizo%40gmail.com-EA4335?style=flat-square&logo=gmail)](mailto:carlosmanuel.turizo@gmail.com)

---

<div align="center">

**[⬆ Volver arriba](#-academix--backend)**

Hecho con Node.js, TypeScript y mucho café ☕

</div>
