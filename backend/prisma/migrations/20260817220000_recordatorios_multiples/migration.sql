-- DropIndex
-- Quito la restriccion unica vieja: ya no puede ser "una tarea, un recordatorio".
ALTER TABLE `recordatorios` DROP INDEX `recordatorios_tarea_id_key`;

-- AlterTable
-- Agrego las columnas para el control de reintentos de envio, y le quito
-- el default a anticipacion_horas (ahora siempre se especifica al crear,
-- segun los umbrales de reminders.constants.ts).
ALTER TABLE `recordatorios`
    ADD COLUMN `intentos_envio` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `ultimo_error` TEXT NULL,
    ADD COLUMN `fallido_definitivo` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `anticipacion_horas` INTEGER NOT NULL;

-- CreateIndex
-- Nueva restriccion unica: la combinacion (tarea, umbral) no se puede
-- repetir, pero una misma tarea si puede tener varios umbrales distintos.
CREATE UNIQUE INDEX `recordatorios_tarea_id_anticipacion_horas_key` ON `recordatorios`(`tarea_id`, `anticipacion_horas`);