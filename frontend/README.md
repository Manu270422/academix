<div align="center">

# 🎓 Academix - Frontend

### Interfaz Web para Sistema de Gestión Académica

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/React_Query-5.62-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)

**Desarrollado por Carlos Manuel Turizo Hernández**  
*Tecnólogo en Análisis y Desarrollo de Software - SENA*

[Características](#-características-principales) • [Instalación](#-instalación) • [Estructura](#-estructura-del-proyecto) • [Despliegue](#-despliegue)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Diseño y UX](#-diseño-y-ux)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#-componentes-principales)
- [Gestión de Estado](#-gestión-de-estado)
- [Despliegue](#-despliegue)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

## 🎯 Sobre el Proyecto

Academix Frontend es una **Single Page Application (SPA)** construida con React y TypeScript que proporciona una interfaz moderna, intuitiva y completamente responsive para que estudiantes gestionen sus materias y tareas académicas.

### ¿Qué hace especial a Academix?

- 🎨 **Diseño profesional** con TailwindCSS
- 📱 **Totalmente responsive** (móvil, tablet, escritorio)
- ⚡ **Rendimiento optimizado** con Vite
- 🔄 **Sincronización automática** con React Query
- 🎭 **Microinteracciones** pulidas (animaciones, transiciones)
- 🌐 **PWA-Ready** (lista para convertirse en Progressive Web App)

---

## ✨ Características Principales

### Autenticación
- ✅ Registro de usuarios con validación en tiempo real
- ✅ Inicio de sesión seguro
- ✅ Renovación automática de tokens (refresh tokens)
- ✅ Persistencia de sesión
- ✅ Protección de rutas privadas

### Gestión de Materias
- ✅ Crear materias con colores personalizados (10 paleta curada)
- ✅ Editar y eliminar materias
- ✅ Visualización en cards con información resumida
- ✅ Contador de tareas por materia
- ✅ Confirmación antes de acciones destructivas

### Gestión de Tareas
- ✅ Crear tareas con título, descripción, fecha y prioridad
- ✅ Tres estados: Pendiente, En Progreso, Completada
- ✅ Tres niveles de prioridad: Baja, Media, Alta
- ✅ **Cambio rápido de estado** con un click (checkbox animado)
- ✅ Filtros combinables (estado, prioridad, materia)
- ✅ Indicadores visuales de urgencia (vencidas, hoy, mañana)
- ✅ Formato de fechas inteligente ("Vence en 3 días")
- ✅ Ordenamiento automático por urgencia

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Alertas de tareas vencidas
- ✅ Sección "Próximas a vencer"
- ✅ Acciones rápidas (crear materia/tarea)
- ✅ Saludo dinámico según hora del día

### Perfil de Usuario
- ✅ Edición de nombre
- ✅ Cambio seguro de contraseña
- ✅ Avatar con iniciales automático

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.3 | Librería UI |
| **TypeScript** | 5.6 | Tipado estático |
| **Vite** | 6.0 | Build tool (HMR ultra-rápido) |
| **TailwindCSS** | 3.4 | Framework de estilos utility-first |
| **React Router** | 7.0 | Enrutamiento SPA |
| **TanStack Query** | 5.62 | Gestión de estado del servidor |
| **Axios** | 1.7 | Cliente HTTP |
| **Lucide React** | - | Iconos modernos |
| **date-fns** | - | Manejo de fechas |

### ¿Por qué estas tecnologías?

**React + TypeScript**: Combinación estándar de la industria para aplicaciones escalables y mantenibles.

**Vite**: Reemplazo moderno de Create React App. Hot Module Replacement instantáneo y builds optimizados.

**TailwindCSS**: Desarrollo rápido sin salir del JSX. Consistencia visual automática.

**React Query**: Cache inteligente, refetch automático, sincronización entre pestañas. Elimina cientos de líneas de código boilerplate.

**Axios con interceptores**: Refresh automático de tokens, manejo centralizado de errores, headers automáticos.

---

## 🎨 Diseño y UX

### Sistema de Colores

```javascript
// Paleta de colores para materias (10 opciones curadas)
const COLORES_MATERIAS = [
  { nombre: 'Azul', hex: '#3B82F6' },
  { nombre: 'Verde', hex: '#10B981' },
  { nombre: 'Amarillo', hex: '#F59E0B' },
  { nombre: 'Rojo', hex: '#EF4444' },
  { nombre: 'Púrpura', hex: '#8B5CF6' },
  { nombre: 'Rosa', hex: '#EC4899' },
  { nombre: 'Turquesa', hex: '#14B8A6' },
  { nombre: 'Naranja', hex: '#F97316' },
  { nombre: 'Índigo', hex: '#6366F1' },
  { nombre: 'Gris', hex: '#6B7280' }
];
```

### Responsive Design

📱 Móvil (< 768px)

Sidebar oculta por defecto
Menú hamburguesa
Grid de 1 columna
Overlay oscuro al abrir menú

📊 Tablet (768px - 1024px)

Sidebar deslizable
Grid de 2 columnas
Espaciado optimizado

🖥️ Desktop (> 1024px)

Sidebar fija lateral
Grid de 3 columnas
Máxima densidad de información

### Microinteracciones

- ✅ Animaciones suaves de entrada/salida de modales
- ✅ Hover states en todos los elementos interactivos
- ✅ Loading states con skeleton screens
- ✅ Feedback visual inmediato en acciones (checkbox, botones)
- ✅ Transiciones de color al cambiar estados

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 20 o superior
- npm o yarn
- Backend de Academix corriendo

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/academix-frontend.git
cd academix-frontend
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# URL del backend
VITE_API_URL=http://localhost:3000/api/v1
```

### Paso 4: Arrancar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará corriendo en `http://localhost:5173` 🎉

### Paso 5: Build para producción

```bash
npm run build
npm run preview  # Para previsualizar el build
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API backend | `http://localhost:3000/api/v1` |

**⚠️ Importante**: En Vite las variables de entorno **deben empezar con `VITE_`** para ser expuestas al cliente.

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (puerto 5173)

# Producción
npm run build            # Compila para producción (carpeta dist/)
npm run preview          # Previsualiza el build localmente

# Utilidades
npm run lint             # Ejecuta ESLint
npm run type-check       # Verifica tipos de TypeScript
```

---

## 📁 Estructura del Proyecto

frontend/
├── public/
│   └── vite.svg                # Favicon
├── src/
│   ├── api/
│   │   ├── client.ts           # Cliente Axios con interceptores
│   │   ├── auth.service.ts     # Servicios de autenticación
│   │   ├── subjects.service.ts # Servicios de materias
│   │   └── tasks.service.ts    # Servicios de tareas
│   ├── components/
│   │   ├── ui/                 # Componentes base reutilizables
│   │   │   ├── Input.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/             # Estructura de la app
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileHeader.tsx
│   │   │   └── AppLayout.tsx
│   │   ├── materias/           # Componentes de materias
│   │   │   ├── MateriaCard.tsx
│   │   │   ├── MateriaForm.tsx
│   │   │   └── ColorPicker.tsx
│   │   ├── tareas/             # Componentes de tareas
│   │   │   ├── TareaCard.tsx
│   │   │   ├── TareaForm.tsx
│   │   │   ├── TareaFiltros.tsx
│   │   │   ├── EstadoBadge.tsx
│   │   │   └── PrioridadBadge.tsx
│   │   ├── perfil/             # Componentes de perfil
│   │   │   ├── InformacionPersonal.tsx
│   │   │   └── CambioPassword.tsx
│   │   └── dashboard/
│   │       ├── EstadisticasCard.tsx
│   │       └── ProximasTareas.tsx
│   ├── context/
│   │   ├── AuthContext.tsx     # Provider de autenticación
│   │   └── AuthContext.ts      # Tipos y context
│   ├── hooks/
│   │   ├── useAuth.ts          # Hook de autenticación
│   │   ├── useForm.ts          # Hook genérico para formularios
│   │   ├── useMaterias.ts      # Hooks de React Query para materias
│   │   └── useTareas.ts        # Hooks de React Query para tareas
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Materias.tsx
│   │   ├── Tareas.tsx
│   │   └── Perfil.tsx
│   ├── types/
│   │   └── index.ts            # Tipos compartidos (Usuario, Materia, Tarea)
│   ├── utils/
│   │   └── fechas.ts           # Utilidades de formateo de fechas
│   ├── App.tsx                 # Rutas principales
│   ├── main.tsx                # Entry point
│   └── index.css               # Estilos globales + Tailwind
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── index.html                  # HTML base
├── package.json
├── tailwind.config.js          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
├── vite.config.ts              # Configuración de Vite
└── README.md

---

## 🧩 Componentes Principales

### Componentes UI Base (`/components/ui`)

```typescript
// Input con label, error y show/hide password
<Input
  label="Contraseña"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={errors.password}
/>

// Button con variantes y loading
<Button 
  variant="primary" 
  size="lg" 
  isLoading={isSubmitting}
  onClick={handleSubmit}
>
  Guardar
</Button>

// Modal con animaciones
<Modal isOpen={isOpen} onClose={handleClose} title="Crear Materia">
  <MateriaForm onSuccess={handleClose} />
</Modal>
```

### Layout (`/components/layout`)

```typescript
// Sidebar responsive con navegación
<Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

// Layout que envuelve todas las páginas internas
<AppLayout>
  <Outlet /> {/* Páginas protegidas */}
</AppLayout>
```

### Hooks Personalizados

```typescript
// Hook de autenticación
const { user, login, logout, isAuthenticated } = useAuth();

// Hook para formularios con validación
const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
  initialValues,
  validationRules,
  onSubmit
});

// Hooks de React Query
const { data: materias, isLoading } = useMateriasList();
const createMateria = useCreateMateria();
const updateTarea = useUpdateTarea();
```

---

## 🔄 Gestión de Estado

### React Query para Estado del Servidor

Todas las peticiones HTTP se manejan con React Query:

```typescript
// Cache automático + refetch inteligente
const { data: tareas, isLoading, error } = useTareasList({
  estado: filtroEstado,
  prioridad: filtroPrioridad
});

// Mutations con invalidación de cache
const updateTareaStatus = useUpdateTareaStatus();

const handleToggleEstado = async (tareaId: number) => {
  await updateTareaStatus.mutateAsync({ 
    id: tareaId, 
    estado: nuevoEstado 
  });
  // React Query invalida automáticamente el cache y refetch
};
```

### Context API para Estado Global

```typescript
// AuthContext: usuario autenticado, login, logout
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider en App.tsx
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
</AuthProvider>
```

### Local State con useState

Para estado UI local (modales abiertos, campos de formulario, etc.):

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);
```

---

## 🚀 Despliegue

### Opción 1: Vercel (Recomendado)

Vercel está optimizado para proyectos Vite/React:

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Despliega:
```bash
vercel
```

3. Configura la variable de entorno:

VITE_API_URL = https://tu-backend.render.com/api/v1

4. Builds automáticos en cada push a `main`

### Opción 2: Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Desplegar
netlify deploy --prod
```

### Opción 3: GitHub Pages

Requiere configuración adicional en `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/nombre-repo/',
  // ...
});
```

### Build Manual

```bash
npm run build
# La carpeta dist/ contiene los archivos estáticos
# Súbelos a cualquier hosting (Hostinger, cPanel, S3, etc.)
```

### Archivo `vercel.json` (Routing SPA)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Este archivo es **crítico** para que las rutas de React Router funcionen correctamente al refrescar la página.

---

## 📸 Capturas de Pantalla

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*Vista principal con estadísticas y tareas próximas a vencer*

### Gestión de Materias
![Materias](./screenshots/materias.png)
*Grid responsive de materias con colores personalizados*

### Gestión de Tareas
![Tareas](./screenshots/tareas.png)
*Listado de tareas con filtros y badges de estado/prioridad*

### Responsive Mobile
![Mobile](./screenshots/mobile.png)
*Interfaz completamente adaptada a móviles*

---

## 🗺️ Roadmap

### Versión Actual (v1.0)
- ✅ Autenticación completa
- ✅ CRUD de materias y tareas
- ✅ Dashboard con estadísticas
- ✅ Filtros avanzados
- ✅ Diseño responsive

### Próximas Versiones

**v1.1 - Mejoras UX**
- [ ] Modo oscuro (dark mode)
- [ ] Drag & drop para reordenar tareas
- [ ] Atajos de teclado
- [ ] Búsqueda global

**v1.2 - Funcionalidades**
- [ ] Vista de calendario mensual
- [ ] Recordatorios por email
- [ ] Exportar tareas a PDF
- [ ] Estadísticas avanzadas con gráficos

**v2.0 - PWA**
- [ ] Instalable como app (PWA)
- [ ] Notificaciones push
- [ ] Modo offline con sincronización
- [ ] Service Workers

---

## 🧪 Testing (Futuro)

```bash
# Tests unitarios con Vitest
npm run test

# Tests E2E con Playwright
npm run test:e2e

# Cobertura
npm run test:coverage
```

---

## 🤝 Contribución

Este es un proyecto académico del programa ADSO - SENA. Si deseas contribuir:

1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/mejora-ui`)
3. Commitea tus cambios (`git commit -m 'Mejorar componente X'`)
4. Push a la rama (`git push origin feature/mejora-ui`)
5. Abre un Pull Request

### Estándares de Código

- Componentes en PascalCase
- Hooks personalizados empiezan con `use`
- Props con TypeScript tipadas
- Comentarios en español
- TailwindCSS para estilos (sin CSS modules)

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

**[⬆ Volver arriba](#-academix---frontend)**

Hecho con React, TypeScript y mucho café ☕

</div>