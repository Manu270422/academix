// ============================================================
// SONIDO DE NOTIFICACIÓN
// ============================================================
// Genero un "beep" corto con la Web Audio API, sin necesitar
// ningun archivo de audio externo (evita temas de licencias y
// de tener que subir un MP3 al proyecto).
//
// Uso dos tonos cortos (como el "ping" de WhatsApp) para que se
// sienta profesional y no como un beep robotico de los 90s.
// ============================================================

let contextoAudio: AudioContext | null = null;

// Reutilizo un solo AudioContext en vez de crear uno nuevo cada vez
// (los navegadores limitan cuantos se pueden crear).
function obtenerContexto(): AudioContext {
  if (!contextoAudio) {
    contextoAudio = new AudioContext();
  }
  return contextoAudio;
}

// Toca un tono simple a una frecuencia y duracion dadas.
function tocarTono(
  contexto: AudioContext,
  frecuencia: number,
  inicioSegundos: number,
  duracionSegundos: number
): void {
  const oscilador = contexto.createOscillator();
  const ganancia = contexto.createGain();

  oscilador.type = 'sine';
  oscilador.frequency.value = frecuencia;

  // Subo el volumen rapido y lo bajo suave al final (evita el "click"
  // feo que se escucha si el sonido corta de golpe).
  const inicio = contexto.currentTime + inicioSegundos;
  ganancia.gain.setValueAtTime(0, inicio);
  ganancia.gain.linearRampToValueAtTime(0.15, inicio + 0.01);
  ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + duracionSegundos);

  oscilador.connect(ganancia);
  ganancia.connect(contexto.destination);

  oscilador.start(inicio);
  oscilador.stop(inicio + duracionSegundos);
}

// Reproduzco el sonido de "notificacion nueva": dos tonos cortos
// ascendentes, como el ping de WhatsApp.
export function reproducirSonidoNotificacion(): void {
  try {
    const contexto = obtenerContexto();
    tocarTono(contexto, 880, 0, 0.12); // La5
    tocarTono(contexto, 1175, 0.1, 0.15); // Re6
  } catch {
    // Si el navegador bloquea el audio (ej. el usuario nunca interactuo
    // con la pagina todavia), no rompo nada, simplemente no suena.
  }
}