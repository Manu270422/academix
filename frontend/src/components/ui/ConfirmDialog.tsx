// ============================================================
// COMPONENTE: CONFIRMDIALOG
// ============================================================
// Dialog de confirmacioóte componente reutilizable porque voy a tener
// muchas confirmaciones a lo largo de la app: borrar materia,
// borrar tarea, cerrar sesión (opcional), etc.
//
// Internamente usa el Modal pero con una API mas específica para "confirmar".
// ============================================================

import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  // Texto del botón de confirmación. Default: "Confirmar".
  confirmText?: string;
  // Texto del botón cancelar. Default: "Cancelar".
  cancelText?: string;
  // Variante visual del botón de confirmar.
  variant?: 'danger' | 'primary';
  // Indica si la operación esta en curso (para mostrar spinner).
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}