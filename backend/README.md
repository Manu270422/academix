<div align="center">

# 🎓 Academix - Backend

### API REST para Sistema de Gestión Académica

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

**Desarrollado por Carlos Manuel Turizo Hernández**  
*Tecnólogo en Análisis y Desarrollo de Software - SENA*

[Documentación](#-documentación) • [Instalación](#-instalación) • [API](#-endpoints-de-la-api) • [Licencia](#-licencia)

</div>

---

## 📋 Tabla de Contenidos

- [🎓 Academix - Backend](#-academix---backend)
    - [API REST para Sistema de Gestión Académica](#api-rest-para-sistema-de-gestión-académica)
  - [📋 Tabla de Contenidos](#-tabla-de-contenidos)
  - [🎯 Sobre el Proyecto](#-sobre-el-proyecto)
    - [¿Por qué Academix?](#por-qué-academix)
  - [✨ Características Principales](#-características-principales)
  - [🛠️ Stack Tecnológico](#️-stack-tecnológico)
    - [Librerías Adicionales](#librerías-adicionales)
  - [🏗️ Arquitectura](#️-arquitectura)
    - [Principios Aplicados](#principios-aplicados)
  - [🚀 Instalación](#-instalación)
    - [Prerrequisitos](#prerrequisitos)
    - [Paso 1: Clonar el repositorio](#paso-1-clonar-el-repositorio)
    - [Paso 2: Instalar dependencias](#paso-2-instalar-dependencias)
    - [Paso 3: Configurar variables de entorno](#paso-3-configurar-variables-de-entorno)
    - [Paso 4: Crear la base de datos](#paso-4-crear-la-base-de-datos)
    - [Paso 5: Aplicar migraciones](#paso-5-aplicar-migraciones)
    - [Paso 6: Arrancar el servidor](#paso-6-arrancar-el-servidor)
  - [🔑 Variables de Entorno](#-variables-de-entorno)
    - [Generar secretos JWT seguros](#generar-secretos-jwt-seguros)
  - [📜 Scripts Disponibles](#-scripts-disponibles)
  - [📡 Endpoints de la API](#-endpoints-de-la-api)
    - [Base URL](#base-url)
    - [🔐 Autenticación](#-autenticación)
    - [📚 Materias](#-materias)
    - [✅ Tareas](#-tareas)
      - [Filtros disponibles en `GET /tasks`:](#filtros-disponibles-en-get-tasks)
    - [🏥 Health Check](#-health-check)
    - [Ejemplo de uso con cURL](#ejemplo-de-uso-con-curl)
  - [🔒 Seguridad](#-seguridad)
    - [Autenticación](#autenticación)
    - [Autorización](#autorización)
    - [Validación](#validación)
    - [Headers HTTP](#headers-http)
    - [Protección contra Vulnerabilidades](#protección-contra-vulnerabilidades)
  - [📁 Estructura del Proyecto](#-estructura-del-proyecto)
  - [🗄️ Base de Datos](#️-base-de-datos)
    - [Modelo Entidad-Relación](#modelo-entidad-relación)
    - [Migraciones](#migraciones)
  - [🚀 Despliegue](#-despliegue)
    - [Opción 1: Render (Recomendado)](#opción-1-render-recomendado)
    - [Opción 2: Railway](#opción-2-railway)
    - [Opción 3: Docker](#opción-3-docker)
    - [Checklist Pre-Despliegue](#checklist-pre-despliegue)
  - [📚 Documentación](#-documentación)
    - [Convenciones de Código](#convenciones-de-código)
    - [Comentarios](#comentarios)
    - [Testing (Futuro)](#testing-futuro)
  - [🤝 Contribución](#-contribución)
  - [📄 Licencia](#-licencia)
  - [📞 Contacto](#-contacto)

---

## 🎯 Sobre el Proyecto

Academix Backend es una API REST profesional construida con TypeScript y Express que permite a estudiantes gestionar sus materias, tareas y fechas de entrega de manera eficiente y segura. El sistema implementa autenticación JWT, aislamiento por usuario y validación robusta de datos.

### ¿Por qué Academix?

Muchos estudiantes enfrentan desorganización académica que afecta su rendimiento. Academix centraliza toda la información en una plataforma segura, accesible desde cualquier dispositivo.

---

## ✨ Características Principales

- 🔐 **Autenticación segura** con JWT (access + refresh tokens)
- 👤 **Aislamiento por usuario** - cada estudiante solo ve su información
- 📚 **Gestión de materias** - CRUD completo con colores personalizados
- ✅ **Gestión de tareas** - estados (pendiente/progreso/completada) y prioridades
- 🔍 **Filtros avanzados** - por estado, prioridad, materia y fechas
- 🛡️ **Validación robusta** - Zod en todos los endpoints
- 🗃️ **Base de datos relacional** - MySQL con Prisma ORM
- 🚀 **TypeScript end-to-end** - tipado fuerte y seguridad en desarrollo
- 📊 **Arquitectura en capas** - rutas, controladores, servicios
- 🔒 **Seguridad profesional** - bcrypt, Helmet, CORS, prevención IDOR

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20 LTS | Runtime de JavaScript |
| **TypeScript** | 5.6 | Tipado estático |
| **Express** | 4.21 | Framework web |
| **Prisma** | 5.22 | ORM y migraciones |
| **MySQL** | 8.0 | Base de datos relacional |
| **JWT** | 9.0 | Autenticación stateless |
| **bcrypt** | 5.1 | Hash de contraseñas |
| **Zod** | 3.23 | Validación de esquemas |

### Librerías Adicionales

- **Helmet** - Headers HTTP seguros
- **CORS** - Control de orígenes
- **Morgan** - Logger de peticiones HTTP
- **dotenv** - Manejo de variables de entorno

---

## 🏗️ Arquitectura

El backend sigue el patrón **arquitectura en capas** con separación clara de responsabilidades:

┌─────────────────────────────────────┐
│         Cliente (Frontend)          │
└─────────────────┬───────────────────┘
│ HTTP/JSON
┌─────────────────▼───────────────────┐
│     Capa de Rutas (Routes)          │  ← Endpoints + Middlewares
├─────────────────────────────────────┤
│   Capa de Controladores             │  ← Manejo de Request/Response
├─────────────────────────────────────┤
│    Capa de Servicios (Business)     │  ← Lógica de negocio
├─────────────────────────────────────┤
│    Capa de Acceso a Datos (Prisma)  │  ← Queries a BD
└─────────────────┬───────────────────┘
│
┌─────────────────▼───────────────────┐
│          Base de Datos MySQL        │
└─────────────────────────────────────┘

### Principios Aplicados

- ✅ Separación de responsabilidades
- ✅ Inyección de dependencias
- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Manejo centralizado de errores

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 20 o superior
- MySQL 8.0 o superior
- npm o yarn

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/academix-backend.git
cd academix-backend
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
# Base de datos
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/academix"

# JWT Secrets (genera tus propios secretos seguros)
JWT_ACCESS_SECRET="tu_secreto_access_muy_seguro"
JWT_REFRESH_SECRET="tu_secreto_refresh_muy_seguro"

# Duración de tokens
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Configuración del servidor
PORT=3000
NODE_ENV="development"

# CORS (frontend URL)
CORS_ORIGINS="http://localhost:5173"
```

### Paso 4: Crear la base de datos

```bash
# Accede a MySQL
mysql -u root -p

# Crea la base de datos
CREATE DATABASE academix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Paso 5: Aplicar migraciones

```bash
npx prisma migrate dev --name init
```

### Paso 6: Arrancar el servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm run build
npm start
```

El servidor estará corriendo en `http://localhost:3000` 🎉

---

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a MySQL | `mysql://user:pass@localhost:3306/academix` |
| `JWT_ACCESS_SECRET` | Secreto para access tokens | (generado con crypto.randomBytes) |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | (generado con crypto.randomBytes) |
| `JWT_ACCESS_EXPIRES_IN` | Duración access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Duración refresh token | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |
| `CORS_ORIGINS` | URLs permitidas (separadas por coma) | `http://localhost:5173` |

### Generar secretos JWT seguros

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

# Utilidades
npm run type-check       # Verifica tipos de TypeScript sin compilar
npm run lint             # (si tienes ESLint configurado)
```

---

## 📡 Endpoints de la API

### Base URL

http://localhost:3000/api/v1

### 🔐 Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/auth/login` | Iniciar sesión | No |
| `POST` | `/auth/refresh` | Renovar access token | Refresh Token |
| `GET` | `/auth/me` | Obtener usuario autenticado | Sí |
| `PATCH` | `/auth/me` | Actualizar perfil | Sí |
| `POST` | `/auth/change-password` | Cambiar contraseña | Sí |

### 📚 Materias

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/subjects` | Crear materia | Sí |
| `GET` | `/subjects` | Listar materias del usuario | Sí |
| `GET` | `/subjects/:id` | Ver detalle de una materia | Sí |
| `PATCH` | `/subjects/:id` | Actualizar materia | Sí |
| `DELETE` | `/subjects/:id` | Eliminar materia | Sí |

### ✅ Tareas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/tasks` | Crear tarea | Sí |
| `GET` | `/tasks` | Listar tareas (con filtros) | Sí |
| `GET` | `/tasks/:id` | Ver detalle de una tarea | Sí |
| `PATCH` | `/tasks/:id` | Actualizar tarea | Sí |
| `PATCH` | `/tasks/:id/status` | Cambiar estado de tarea | Sí |
| `DELETE` | `/tasks/:id` | Eliminar tarea | Sí |

#### Filtros disponibles en `GET /tasks`:

- `estado` - `PENDIENTE` | `EN_PROGRESO` | `COMPLETADA`
- `prioridad` - `BAJA` | `MEDIA` | `ALTA`
- `materiaId` - ID de la materia
- `desde` - Fecha inicio (ISO 8601)
- `hasta` - Fecha fin (ISO 8601)

### 🏥 Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Información de la API |
| `GET` | `/health` | Estado del servidor |

### Ejemplo de uso con cURL

```bash
# Registro
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos Turizo",
    "email": "carlos@example.com",
    "password": "MiPassword123"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@example.com",
    "password": "MiPassword123"
  }'

# Crear materia (requiere token)
curl -X POST http://localhost:3000/api/v1/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d '{
    "nombre": "Matemáticas IV",
    "color": "#3B82F6",
    "descripcion": "Ecuaciones diferenciales"
  }'
```

---

## 🔒 Seguridad

El backend implementa múltiples capas de seguridad:

### Autenticación

- ✅ **JWT dual-token**: Access token (15 min) + Refresh token (7 días)
- ✅ **bcrypt con 12 rounds**: Contraseñas hasheadas de forma segura
- ✅ **Salt automático**: Cada contraseña tiene su propio salt único
- ✅ **Rotación de refresh tokens**: Cada renovación emite un nuevo refresh token

### Autorización

- ✅ **Aislamiento por usuario**: Cada endpoint verifica `usuarioId` en las queries
- ✅ **Prevención IDOR**: Verificación de propiedad en cada recurso
- ✅ **Respuesta 404 vs 403**: No revelar existencia de recursos ajenos

### Validación

- ✅ **Zod en todos los endpoints**: Validación estricta de tipos y formatos
- ✅ **Límites de longitud**: Prevención de DoS por payloads gigantes
- ✅ **Sanitización de entrada**: Protección contra inyecciones

### Headers HTTP

- ✅ **Helmet**: Headers de seguridad automáticos
- ✅ **CORS controlado**: Whitelist de orígenes permitidos
- ✅ **HTTPS en producción**: Certificados SSL automáticos

### Protección contra Vulnerabilidades

| Vulnerabilidad | Mitigación |
|----------------|------------|
| SQL Injection | Prisma con prepared statements |
| IDOR | Verificación de `usuarioId` en cada query |
| XSS | React escapa automáticamente (frontend) |
| CSRF | JWT en header (no cookies) |
| User Enumeration | Respuestas genéricas en login |
| Brute Force | bcrypt lento intencionalmente |

---

## 📁 Estructura del Proyecto

backend/
├── prisma/
│   ├── schema.prisma           # Modelo de datos
│   └── migrations/             # Migraciones SQL versionadas
├── src/
│   ├── config/
│   │   ├── env.ts              # Configuración de variables de entorno
│   │   └── database.ts         # Cliente de Prisma
│   ├── middlewares/
│   │   ├── authenticate.ts     # Middleware de autenticación JWT
│   │   ├── validate.ts         # Middleware de validación con Zod
│   │   └── errorHandler.ts     # Manejo centralizado de errores
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── auth.service.ts # Lógica de negocio
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
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
│   │   └── express.d.ts        # Extensión de tipos de Express
│   ├── utils/
│   │   ├── logger.ts           # Logger personalizado
│   │   ├── password.ts         # Utilidades de bcrypt
│   │   └── jwt.ts              # Utilidades de JWT
│   ├── app.ts                  # Configuración de Express
│   └── server.ts               # Entry point
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json               # Configuración de TypeScript
└── README.md

---

## 🗄️ Base de Datos

### Modelo Entidad-Relación

┌─────────────┐
│   Usuario   │
├─────────────┤
│ id (PK)     │
│ email       │──┐
│ nombre      │  │
│ password    │  │ 1:N
│ created_at  │  │
│ updated_at  │  │
└─────────────┘  │
│
▼
┌─────────────┐
│   Materia   │
├─────────────┤
│ id (PK)     │
│ nombre      │──┐
│ color       │  │
│ descripcion │  │ 1:N
│ usuario_id  │  │
│ created_at  │  │
│ updated_at  │  │
└─────────────┘  │
│
▼
┌─────────────┐
│    Tarea    │
├─────────────┤
│ id (PK)     │
│ titulo      │
│ descripcion │
│ fecha_entrega│
│ estado      │
│ prioridad   │
│ materia_id  │
│ created_at  │
│ updated_at  │
└─────────────┘

### Migraciones

Las migraciones se gestionan con Prisma:

```bash
# Crear una nueva migración
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones en producción
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status
```

---

## 🚀 Despliegue

### Opción 1: Render (Recomendado)

1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno
4. Render detectará automáticamente que es un proyecto Node.js
5. El build command será: `npm install && npm run build`
6. El start command será: `npm start`

### Opción 2: Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up
```

### Opción 3: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos MySQL creada
- [ ] Migraciones aplicadas con `prisma migrate deploy`
- [ ] Secretos JWT generados aleatoriamente
- [ ] CORS configurado con el dominio del frontend
- [ ] NODE_ENV en "production"
- [ ] Logs configurados correctamente

---

## 📚 Documentación

### Convenciones de Código

- **Nombres de archivos**: camelCase para archivos `.ts`, kebab-case para carpetas
- **Funciones**: camelCase
- **Clases**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Rutas**: kebab-case en URLs

### Comentarios

El código incluye comentarios en primera persona explicando decisiones técnicas complejas.

### Testing (Futuro)

```bash
# Tests unitarios (pendiente implementación)
npm test

# Tests de integración
npm run test:integration

# Cobertura
npm run test:coverage
```

---

## 🤝 Contribución

Este es un proyecto académico del programa ADSO - SENA. Si deseas contribuir:

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commitea tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de uso académico y educativo.

**Desarrollado con ❤️ por Carlos Manuel Turizo Hernández**  
*Tecnólogo en Análisis y Desarrollo de Software - SENA*  
*Barrancabermeja, Santander - Colombia 🇨🇴*

---

## 📞 Contacto

- **GitHub**: [@tu-usuario](https://github.com/Manu27042)
- **LinkedIn**: [Tu perfil](https://linkedin.com/in/carlos-manuel-turizo-hernández)
- **Email**: carlosmanuel.turizo@gmail.com

---

<div align="center">

**[⬆ Volver arriba](#-academix---backend)**

Hecho con Node.js, TypeScript y mucho café ☕

</div>