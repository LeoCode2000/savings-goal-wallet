# 05 — Native Library

> **Status: implemented.** The library lives at `libraries/native-implementations/` (package `react-native-native-implementations`) and is consumed by `app/` through `NativeDialogAdapter`. HU4 no longer relies on the `Alert.alert` fallback.

---

## Option Comparison

| Criterion | A: `<DepositInput />` | B: `showConfirmDialog()` | C: `notifyGoalCompleted()` |
|-----------|----------------------|--------------------------|---------------------------|
| Complexity | High — native view + bridge | Medium | Low |
| Demo value | Medium | **High** — real AlertDialog visible | Medium |
| Reusability | Low | **High** — generic dialog | Medium |
| Testable | Hard | **Easy** — mock the module | Easy |
| TurboModule fit | Weak — view requires fabric | **Strong** — JSI method call | Strong |
| Time risk | High | Medium | Low |
| HU coverage | Partial HU2 | **Full HU4** | Full HU4 |

---

## Decision: Option B — `showConfirmDialog`

The shipped API is callback-based; the `Promise<boolean>` stays internal to the library so callers never handle a rejected native call:

```typescript
showConfirmDialog(options: {
  title: string;
  message: string;
  confirmText?: string; // default 'Aceptar'
  cancelText?: string;  // default 'Cancelar'
  onPress: () => void;
  onCancel?: () => void;
}): void
```

**Why:**
- Exposes real Kotlin code (`AlertDialog.Builder`) — demonstrates native authoring
- Clean, typed JS contract — ideal TurboModule candidate
- Mockable in unit tests with a single `jest.mock()`
- Directly satisfies HU4 (goal completion confirmation)
- Does not depend on React Native's own `Alert.alert` (which doesn't count as custom native code)

---

## TurboModule Spec (`libraries/native-implementations/`)

```
libraries/native-implementations/
├── package.json                      # name: "react-native-native-implementations"
│                                     # codegenConfig.name: "NativeImplementationsSpec"
├── src/
│   ├── NativeNativeImplementations.ts # TurboModule spec (codegen input)
│   ├── showConfirmDialog.native.ts    # native wrapper (callback API)
│   ├── showConfirmDialog.ts           # web fallback (window.confirm)
│   ├── index.tsx                      # public API
│   └── __tests__/showConfirmDialog.test.ts
├── android/src/main/java/com/nativeimplementations/
│   ├── NativeImplementationsModule.kt # AlertDialog.Builder implementation
│   └── NativeImplementationsPackage.kt
├── ios/
│   ├── NativeImplementations.h
│   └── NativeImplementations.mm       # UIAlertController implementation
├── NativeImplementations.podspec
└── README.md
```

**TurboModule registration** follows the `create-react-native-library` turbo-module template with `codegenConfig` in `package.json`. `app/` depends on it via `file:../libraries/native-implementations` and picks it up through Yarn workspaces plus RN autolinking.

---

## Integration with `app/`

`app/src/infrastructure/adapters/NativeDialogAdapter.ts` is the only file in the app that imports the library. It owns the copy and the button labels, and exposes two dialogs:

```typescript
import { showConfirmDialog } from 'react-native-native-implementations';

export function showDepositSuccessDialog({ ... }: DepositSuccessDialogOptions): void {
  showConfirmDialog({
    title: '✅ Abono exitoso',
    message: `Abonaste ${formatAmount(amount)} a "${goalName}". Total acumulado: ${formatAmount(accumulatedAmount)}.`,
    confirmText: 'Seguir abonando',
    cancelText: 'Volver a mis metas',
    onPress: () => onKeepSaving?.(),
    onCancel: onGoBack,
  });
}

export function showGoalCompletedDialog({ ... }: GoalCompletedDialogOptions): void { /* '🎉 ¡Meta completada!' */ }
```

Both buttons of the two-button native dialog are used as navigation, so neither ends up as a meaningless "Cancelar".

`GoalDetailScreen` picks exactly one dialog per deposit: `MakeDeposit` invokes the injected `onGoalCompleted` callback, the screen records the `GoalCompleted` event, and after pushing `GOAL_UPDATED` to the WebView it shows the completion dialog when the event fired, or the deposit-success dialog otherwise. The domain and application layers keep no dependency on the native module.

**Testing:** `app/__mocks__/react-native-native-implementations.js` is wired through `moduleNameMapper` in `app/jest.config.js`, so `app/__tests__/infrastructure/NativeDialogAdapter.test.ts` asserts the copy and callback wiring without a native runtime.
