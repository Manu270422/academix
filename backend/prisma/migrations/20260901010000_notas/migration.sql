-- CreateTable
CREATE TABLE `notas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contenido` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `materia_id` INTEGER NOT NULL,

    INDEX `notas_materia_id_idx`(`materia_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_materia_id_fkey` FOREIGN KEY (`materia_id`) REFERENCES `materias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
