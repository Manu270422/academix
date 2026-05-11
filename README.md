<div align="center">

# 🎓 Academix

### Sistema de Gestión Académica para Estudiantes

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

**Desarrollado por Carlos Manuel Turizo Hernández**  
*Tecnólogo en Análisis y Desarrollo de Software - SENA*  
*Barrancabermeja, Santander - Colombia 🇨🇴*

[Ver Demo](#-demo) • [Características](#-características) • [Instalación](#-instalación-rápida) • [Arquitectura](#-arquitectura)

</div>

---

## 📖 ¿Qué es Academix?

**Academix** es una aplicación web full stack diseñada para ayudar a los estudiantes a **organizar su vida académica** en un solo lugar. Permite gestionar materias y tareas con un sistema de prioridades, estados y fechas de vencimiento, todo a través de una interfaz moderna, intuitiva y completamente responsive.

> Desarrollado como proyecto integrador del programa **Análisis y Desarrollo de Software (ADSO)** del SENA.

---

## ✨ Características

- 🔐 **Autenticación segura** — Registro, inicio de sesión y renovación automática de tokens (JWT + refresh tokens)
- 📚 **Gestión de materias** — Crea y organiza tus materias con colores personalizados
- ✅ **Gestión de tareas** — Crea tareas con título, descripción, fecha límite y nivel de prioridad (Baja / Media / Alta)
- 🔄 **Estados de tareas** — Pendiente, En Progreso y Completada con cambio rápido en un click
- 🔍 **Filtros combinables** — Filtra por estado, prioridad y materia simultáneamente
- ⚠️ **Alertas de urgencia** — Indicadores visuales para tareas vencidas, que vencen hoy o mañana
- 📊 **Dashboard** — Estadísticas en tiempo real, accesos rápidos y resumen de tareas próximas
- 👤 **Perfil de usuario** — Edición de datos personales y cambio seguro de contraseña
- 📱 **Diseño responsive** — Adaptado para móvil, tablet y escritorio

---

## 🗂️ Estructura del Repositorio

```
academix/
├── frontend/          # SPA con React + TypeScript
│   └── README.md      # Documentación del Frontend
├── backend/           # API REST con Node.js
│   └── README.md      # Documentación del Backend
└── README.md          # ← Estás aquí
```

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| React 18 + TypeScript | Interfaz de usuario con tipado estático |
| Vite 6 | Servidor de desarrollo y build optimizado |
| TailwindCSS 3 | Estilos utility-first |
| React Router 7 | Enrutamiento SPA |
| TanStack Query 5 | Gestión de estado del servidor y caché |
| Axios | Cliente HTTP con interceptores |

### Backend
| Tecnología | Propósito |
|------------|-----------|
| Node.js 20 | Entorno de ejecución |
| Express | Framework para la API REST |
| JWT | Autenticación stateless |
| Base de datos relacional | Persistencia de datos |

---

## 🚀 Instalación Rápida

### Prerrequisitos

- Node.js 20 o superior
- npm o yarn
- Base de datos configurada (ver README del backend)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Manu270422/academix.git
cd academix
```

### 2. Configurar y arrancar el Backend

```bash
cd backend
npm install
cp .env.example .env   # Edita las variables de entorno
npm run dev
```

El backend correrá en `http://localhost:3000`

### 3. Configurar y arrancar el Frontend

```bash
cd ../frontend
npm install
cp .env.example .env   # Configura VITE_API_URL=http://localhost:3000/api/v1
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` 🎉

> Para documentación detallada de cada capa, consulta los READMEs individuales en [`/frontend`](./frontend/README.md) y [`/backend`](./backend/README.md).

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────┐
│           Navegador / Cliente        │
│         React SPA (puerto 5173)      │
└──────────────┬──────────────────────┘
               │ HTTP / REST (Axios)
               ▼
┌─────────────────────────────────────┐
│           API REST (Express)         │
│           Node.js (puerto 3000)      │
│  Rutas: /api/v1/auth, /materias,     │
│         /tareas, /usuarios           │
└──────────────┬──────────────────────┘
               │ ORM / Query
               ▼
┌─────────────────────────────────────┐
│          Base de Datos               │
│       (Relacional)                   │
└─────────────────────────────────────┘
```

El frontend se comunica con el backend exclusivamente a través de la API REST. La autenticación se gestiona con **JWT** y **refresh tokens**, permitiendo sesiones persistentes y seguras.

---

## 🗺️ Roadmap

**v1.0 — Actual**
- ✅ Autenticación completa (registro, login, refresh tokens)
- ✅ CRUD de materias con colores personalizados
- ✅ CRUD de tareas con prioridades, estados y fechas
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Diseño responsive (móvil, tablet, escritorio)

**v1.1 — Próximamente**
- [ ] Modo oscuro (dark mode)
- [ ] Drag & drop para reordenar tareas
- [ ] Búsqueda global
- [ ] Vista de calendario mensual

**v2.0 — Futuro**
- [ ] PWA instalable con notificaciones push
- [ ] Modo offline con sincronización
- [ ] Exportar tareas a PDF
- [ ] Estadísticas avanzadas con gráficos

---

## 🤝 Contribución

Este es un proyecto académico. Si deseas contribuir:

1. Haz un fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Commitea tus cambios: `git commit -m 'Agrega funcionalidad X'`
4. Haz push: `git push origin feature/mi-mejora`
5. Abre un Pull Request

---

## 📄 Licencia

Proyecto de uso académico y educativo — SENA ADSO.

---

## 📞 Contacto

**Carlos Manuel Turizo Hernández**

- 🐙 GitHub: [@Manu270422](https://github.com/Manu270422/)
- 💼 LinkedIn: [carlos-manuel-turizo-hernández](https://linkedin.com/in/carlos-manuel-turizo-hernández)
- 📧 Email: carlosmanuel.turizo@gmail.com

---

<div align="center">

**[⬆ Volver arriba](#-academix)**

Hecho con React, Node.js y mucho café ☕

</div>
