# react-native-native-implementations

Native implementation for react native test app test app

## Installation


```sh
npm install react-native-native-implementations
```


## Usage


```js
import { showConfirmDialog } from 'react-native-native-implementations';

showConfirmDialog({
  title: '¡Meta completada!',
  message: 'Alcanzaste tu meta. ¿Continuar?',
  confirmText: 'Ver meta',
  cancelText: 'Cerrar',
  onPress: () => {
    // Called only when the user confirms
  },
  onCancel: () => {
    // Called when the user cancels or dismisses the dialog
  },
});
```

`showConfirmDialog` opens a native confirm dialog (`AlertDialog` on Android, `UIAlertController` on iOS). `confirmText` and `cancelText` are optional and default to **Aceptar** and **Cancelar**. `onPress` runs when the user confirms; optional `onCancel` runs when the user cancels or dismisses the dialog.

On web, the same API falls back to `window.confirm`. Browsers do not support custom button labels for this native browser dialog.


## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
