import { showConfirmDialog } from 'react-native-native-implementations';
import {
  showDepositSuccessDialog,
  showGoalCompletedDialog,
} from '../../src/infrastructure/adapters/NativeDialogAdapter';

const showConfirmDialogMock = showConfirmDialog as jest.MockedFunction<
  typeof showConfirmDialog
>;

function lastOptions() {
  return showConfirmDialogMock.mock.calls[
    showConfirmDialogMock.mock.calls.length - 1
  ][0];
}

describe('NativeDialogAdapter', () => {
  beforeEach(() => {
    showConfirmDialogMock.mockReset();
  });

  describe('showDepositSuccessDialog', () => {
    it('shows the deposit amount and the new accumulated total', () => {
      showDepositSuccessDialog({
        goalName: 'Viaje a Japón',
        amount: 50000,
        accumulatedAmount: 250000,
        onGoBack: jest.fn(),
      });

      expect(showConfirmDialogMock).toHaveBeenCalledTimes(1);
      const options = lastOptions();
      expect(options.title).toBe('✅ Abono exitoso');
      expect(options.message).toBe(
        'Abonaste $50.000 a "Viaje a Japón". Total acumulado: $250.000.',
      );
      expect(options.confirmText).toBe('Seguir abonando');
      expect(options.cancelText).toBe('Volver a mis metas');
    });

    it('navigates back when the user picks the cancel button', () => {
      const onKeepSaving = jest.fn();
      const onGoBack = jest.fn();

      showDepositSuccessDialog({
        goalName: 'Viaje a Japón',
        amount: 50000,
        accumulatedAmount: 250000,
        onKeepSaving,
        onGoBack,
      });

      lastOptions().onCancel?.();

      expect(onGoBack).toHaveBeenCalledTimes(1);
      expect(onKeepSaving).not.toHaveBeenCalled();
    });

    it('stays on the screen when the user picks the confirm button', () => {
      const onKeepSaving = jest.fn();
      const onGoBack = jest.fn();

      showDepositSuccessDialog({
        goalName: 'Viaje a Japón',
        amount: 50000,
        accumulatedAmount: 250000,
        onKeepSaving,
        onGoBack,
      });

      lastOptions().onPress();

      expect(onKeepSaving).toHaveBeenCalledTimes(1);
      expect(onGoBack).not.toHaveBeenCalled();
    });

    it('does not throw when onKeepSaving is omitted', () => {
      showDepositSuccessDialog({
        goalName: 'Viaje a Japón',
        amount: 50000,
        accumulatedAmount: 250000,
        onGoBack: jest.fn(),
      });

      expect(() => lastOptions().onPress()).not.toThrow();
    });
  });

  describe('showGoalCompletedDialog', () => {
    it('shows the goal name and the final amount', () => {
      showGoalCompletedDialog({
        goalName: 'Fondo de emergencia',
        finalAmount: 1200000,
        onSeeGoals: jest.fn(),
      });

      expect(showConfirmDialogMock).toHaveBeenCalledTimes(1);
      const options = lastOptions();
      expect(options.title).toBe('🎉 ¡Meta completada!');
      expect(options.message).toBe(
        'Alcanzaste tu meta "Fondo de emergencia" con $1.200.000. ¡Felicitaciones!',
      );
      expect(options.confirmText).toBe('Ver mis metas');
      expect(options.cancelText).toBe('Quedarme aquí');
    });

    it('navigates to the goal list when the user picks the confirm button', () => {
      const onSeeGoals = jest.fn();
      const onStay = jest.fn();

      showGoalCompletedDialog({
        goalName: 'Fondo de emergencia',
        finalAmount: 1200000,
        onSeeGoals,
        onStay,
      });

      lastOptions().onPress();

      expect(onSeeGoals).toHaveBeenCalledTimes(1);
      expect(onStay).not.toHaveBeenCalled();
    });

    it('stays on the screen when the user dismisses the dialog', () => {
      const onSeeGoals = jest.fn();
      const onStay = jest.fn();

      showGoalCompletedDialog({
        goalName: 'Fondo de emergencia',
        finalAmount: 1200000,
        onSeeGoals,
        onStay,
      });

      lastOptions().onCancel?.();

      expect(onStay).toHaveBeenCalledTimes(1);
      expect(onSeeGoals).not.toHaveBeenCalled();
    });

    it('does not throw when onStay is omitted', () => {
      showGoalCompletedDialog({
        goalName: 'Fondo de emergencia',
        finalAmount: 1200000,
        onSeeGoals: jest.fn(),
      });

      expect(() => lastOptions().onCancel?.()).not.toThrow();
    });
  });
});
