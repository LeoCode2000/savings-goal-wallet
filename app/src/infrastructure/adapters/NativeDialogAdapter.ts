import { showConfirmDialog } from 'react-native-native-implementations';

// Only file in the app that talks to the native dialog library
function formatAmount(value: number): string {
  return `$${value.toLocaleString('es-CO')}`;
}

export type DepositSuccessDialogOptions = {
  goalName: string;
  amount: number;
  accumulatedAmount: number;
  onKeepSaving?: () => void;
  onGoBack: () => void;
};

export type GoalCompletedDialogOptions = {
  goalName: string;
  finalAmount: number;
  onSeeGoals: () => void;
  onStay?: () => void;
};

export function showDepositSuccessDialog({
  goalName,
  amount,
  accumulatedAmount,
  onKeepSaving,
  onGoBack,
}: DepositSuccessDialogOptions): void {
  showConfirmDialog({
    title: '✅ Abono exitoso',
    message: `Abonaste ${formatAmount(amount)} a "${goalName}". Total acumulado: ${formatAmount(
      accumulatedAmount,
    )}.`,
    confirmText: 'Seguir abonando',
    cancelText: 'Volver a mis metas',
    onPress: () => onKeepSaving?.(),
    onCancel: onGoBack,
  });
}

export function showGoalCompletedDialog({
  goalName,
  finalAmount,
  onSeeGoals,
  onStay,
}: GoalCompletedDialogOptions): void {
  showConfirmDialog({
    title: '🎉 ¡Meta completada!',
    message: `Alcanzaste tu meta "${goalName}" con ${formatAmount(
      finalAmount,
    )}. ¡Felicitaciones!`,
    confirmText: 'Ver mis metas',
    cancelText: 'Quedarme aquí',
    onPress: onSeeGoals,
    onCancel: () => onStay?.(),
  });
}
