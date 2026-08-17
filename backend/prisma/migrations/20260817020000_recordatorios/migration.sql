-- CreateTable
CREATE TABLE `recordatorios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anticipacion_horas` INTEGER NOT NULL DEFAULT 24,
    `enviado_email` BOOLEAN NOT NULL DEFAULT false,
    `fecha_envio_email` DATETIME(3) NULL,
    `leido_en_app` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tarea_id` INTEGER NOT NULL,

    UNIQUE INDEX `recordatorios_tarea_id_key`(`tarea_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `recordatorios` ADD CONSTRAINT `recordatorios_tarea_id_fkey` FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;