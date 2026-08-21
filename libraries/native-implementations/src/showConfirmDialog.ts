export type ShowConfirmDialogOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onPress: () => void;
  onCancel?: () => void;
};

type ConfirmFn = (message: string) => boolean;

function getConfirm(): ConfirmFn | undefined {
  const globalConfirm = (globalThis as { confirm?: ConfirmFn }).confirm;
  return typeof globalConfirm === 'function' ? globalConfirm : undefined;
}

export function showConfirmDialog({
  title,
  message,
  onPress,
  onCancel,
}: ShowConfirmDialogOptions): void {
  const confirm = getConfirm();
  const confirmed = confirm ? confirm(`${title}\n\n${message}`) : false;

  if (confirmed) {
    onPress();
  } else {
    onCancel?.();
  }
}
