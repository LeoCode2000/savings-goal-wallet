import NativeImplementations from './NativeNativeImplementations';

export type ShowConfirmDialogOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onPress: () => void;
  onCancel?: () => void;
};

export function showConfirmDialog({
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onPress,
  onCancel,
}: ShowConfirmDialogOptions): void {
  NativeImplementations.showConfirmDialog(
    title,
    message,
    confirmText,
    cancelText
  )
    .then((confirmed) => {
      if (confirmed) {
        onPress();
      } else {
        onCancel?.();
      }
    })
    .catch(() => {
      // Native reject (e.g. no activity) means the dialog never appeared.
    });
}
