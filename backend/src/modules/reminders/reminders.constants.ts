// ============================================================
// CONSTANTES DEL MODULO DE RECORDATORIOS
// ============================================================
// Aqui defino los umbrales de anticipacion (en horas) con los que
// se avisa al estudiante antes de que venza una tarea.
//
// La dejo separada de reminders.service.ts y de tasks.service.ts
// a proposito: es una regla de NEGOCIO (cuando avisar), no logica
// de como se procesa. El dia que agregue preferencias configurables
// por estudiante, este arreglo fijo se reemplaza por una consulta
// a la config de cada usuario, y ni el cron ni la creacion de tareas
// tienen que cambiar su forma de trabajar.
// ============================================================

// 3 dias antes, 1 dia antes, y 6 horas antes de la fecha de entrega.
export const UMBRALES_RECORDATORIO_HORAS = [72, 24, 6] as const;

// Maximo de intentos de envio antes de darme por vencido con un
// recordatorio (ver reminders.service.ts).
export const MAX_INTENTOS_ENVIO = 3;