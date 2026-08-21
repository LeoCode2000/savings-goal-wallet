import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { showConfirmDialog } from '../showConfirmDialog.native';
import NativeImplementations from '../NativeNativeImplementations';

jest.mock('../NativeNativeImplementations', () => ({
  __esModule: true,
  default: {
    showConfirmDialog: jest.fn(),
  },
}));

const showConfirmDialogNative =
  NativeImplementations.showConfirmDialog as jest.MockedFunction<
    typeof NativeImplementations.showConfirmDialog
  >;

describe('showConfirmDialog', () => {
  beforeEach(() => {
    showConfirmDialogNative.mockReset();
  });

  it('calls onPress when the user accepts', async () => {
    showConfirmDialogNative.mockResolvedValue(true);
    const onPress = jest.fn();
    const onCancel = jest.fn();

    showConfirmDialog({
      title: 'Meta completada',
      message: '¿Continuar?',
      confirmText: 'Continuar',
      cancelText: 'Ahora no',
      onPress,
      onCancel,
    });

    await Promise.resolve();

    expect(showConfirmDialogNative).toHaveBeenCalledWith(
      'Meta completada',
      '¿Continuar?',
      'Continuar',
      'Ahora no'
    );
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel and not onPress when the user cancels', async () => {
    showConfirmDialogNative.mockResolvedValue(false);
    const onPress = jest.fn();
    const onCancel = jest.fn();

    showConfirmDialog({
      title: 'Meta completada',
      message: '¿Continuar?',
      onPress,
      onCancel,
    });

    await Promise.resolve();

    expect(showConfirmDialogNative).toHaveBeenCalledWith(
      'Meta completada',
      '¿Continuar?',
      'Aceptar',
      'Cancelar'
    );
    expect(onPress).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
