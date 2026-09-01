-- AlterTable
ALTER TABLE `materias` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `tareas` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `materias_deleted_at_idx` ON `materias`(`deleted_at`);

-- CreateIndex
CREATE INDEX `tareas_deleted_at_idx` ON `tareas`(`deleted_at`);
