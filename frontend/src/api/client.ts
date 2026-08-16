// ============================================================
// CLIENTE HTTP CON AXIOS
// ============================================================
// Aqui creo una instancia de Axios configurada para mi backend.
// La gracia de tener una instancia centralizada es que puedo:
//   1. Configurar la URL base UNA vez (no la repito en cada llamada).
//   2. Anadir el token JWT automaticamente con un interceptor.
//   3. Manejar errores 401 (token expirado) con refresh transparente.
//
// Sin esta capa, tendria que escribir el header Authorization
// manualmente en cada peticion. Con interceptores, lo hago una vez
// y aplica a todo.
// ============================================================

import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

// ============================================================
// CONFIGURACION BASE
// ============================================================

// Vite expone las variables de entorno bajo "import.meta.env".
// Si no esta definida, uso localhost como fallback en desarrollo.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

// Creo la instancia principal de Axios.
// Esta es la que voy a usar en todos mis servicios (auth, materias, tareas).
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 60 segundos de timeout. Si el backend no responde, se rinde.
  // Asi el usuario no se queda esperando indefinidamente.
  timeout: 60000,
});

// ============================================================
// HELPERS PARA MANEJAR LOS TOKENS EN localStorage
// ============================================================
// Centralizo aqui el guardado/lectura de tokens para no andar tocando
// localStorage por todo el codigo. Si manana decido usar cookies o
// algun otro storage, cambio solo aqui.

const ACCESS_TOKEN_KEY = 'academix_access_token';
const REFRESH_TOKEN_KEY = 'academix_refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ============================================================
// INTERCEPTOR DE REQUEST
// ============================================================
// Este interceptor se ejecuta ANTES de cada peticion saliente.
// Su trabajo es: si tengo un accessToken guardado, anadirlo al header
// Authorization automaticamente. Asi no tengo que hacerlo manualmente
// en cada llamada.
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// INTERCEPTOR DE RESPONSE - REFRESH AUTOMATICO DE TOKEN
// ============================================================
// Este es el truco mas util de toda esta capa: si el backend responde
// 401 (token expirado), automaticamente uso el refreshToken para obtener
// uno nuevo y RE-INTENTO la peticion original. Todo transparente al
// usuario: no se entera de que su token expiro.
//
// Variables auxiliares para evitar bucles infinitos: si el refresh tambien
// falla, no quiero seguir intentando para siempre.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// Procesa la cola de peticiones que estaban esperando el refresh.
function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  // Si todo va bien, devuelvo la respuesta tal cual.
  (response) => response,

  // Si hay un error, evaluo si es 401 y trato de refrescar.
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Caso 1: no es 401, o ya intente refrescar antes -> rechazo el error.
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Caso 2: la peticion fallida ES el refresh -> hago logout y rechazo.
    // Si no hago esto, entraria en bucle infinito de intentos.
    if (originalRequest.url?.includes('/auth/refresh')) {
      tokenStorage.clear();
      // Recargo la pagina para que el usuario vea el login.
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Caso 3: ya hay un refresh en curso. Pongo esta peticion en cola
    // y la reintento cuando el refresh termine. Asi evito hacer
    // multiples refresh simultaneos.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Caso 4: es la primera peticion 401, intento refrescar.
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      // No tengo refresh token guardado: mando al login.
      tokenStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      // Hago la peticion de refresh con una instancia "limpia" de axios
      // para que no entre el interceptor (evito recursion).
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Guardo los nuevos tokens.
      tokenStorage.setTokens(accessToken, newRefreshToken);

      // Procesa la cola de peticiones que estaban esperando.
      processQueue(null, accessToken);

      // Reintento la peticion original con el nuevo token.
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      // El refresh tambien fallo: limpio tokens y mando al login.
      processQueue(refreshError, null);
      tokenStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);