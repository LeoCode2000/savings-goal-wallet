import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  showConfirmDialog(
    title: string,
    message: string,
    confirmText: string,
    cancelText: string
  ): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeImplementations');
