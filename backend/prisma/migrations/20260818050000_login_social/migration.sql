-- AlterTable
-- password_hash pasa de obligatorio a opcional: las cuentas que
-- entran por Google/Microsoft/Facebook nunca tienen contrasena.
ALTER TABLE `usuarios`
    MODIFY `password_hash` VARCHAR(255) NULL,
    ADD COLUMN `proveedor_auth` ENUM('LOCAL', 'GOOGLE', 'MICROSOFT', 'FACEBOOK') NOT NULL DEFAULT 'LOCAL',
    ADD COLUMN `proveedor_id` VARCHAR(255) NULL;

-- CreateIndex
-- Evita que dos cuentas del mismo proveedor social terminen
-- apuntando al mismo ID externo. Las cuentas LOCAL (proveedor_id
-- null) no se ven afectadas por esta restriccion en MySQL.
CREATE UNIQUE INDEX `usuarios_proveedor_auth_proveedor_id_key` ON `usuarios`(`proveedor_auth`, `proveedor_id`);