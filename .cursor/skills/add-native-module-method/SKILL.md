---
name: add-native-module-method
description: Adds a method to the react-native-native-implementations TurboModule end to end, covering the codegen spec, the Kotlin and Objective-C implementations, the platform-split JS wrappers, tests and the app-side adapter. Use when adding, changing or removing a native capability in libraries/native-implementations, when the user mentions TurboModule, codegen, native dialog, AlertDialog, UIAlertController, or when native code needs to be exposed to JavaScript in this repo.
---

# Adding a TurboModule method

The library at `libraries/native-implementations/` (package `react-native-native-implementations`) exposes native capabilities to `app/`. Every method touches seven files. Skipping one produces either a codegen failure or a method that silently does not exist at runtime.

`showConfirmDialog` is the reference implementation — read it before writing a new method and mirror its structure.

## Checklist

```
- [ ] 1. Spec:      src/NativeNativeImplementations.ts
- [ ] 2. Native JS: src/<method>.native.ts
- [ ] 3. Web JS:    src/<method>.ts
- [ ] 4. Export:    src/index.tsx
- [ ] 5. Android:   NativeImplementationsModule.kt
- [ ] 6. iOS:       NativeImplementations.mm
- [ ] 7. Test:      src/__tests__/<method>.test.ts
- [ ] 8. README + rebuild
```

## 1. Codegen spec

Add the method to the `Spec` interface in `src/NativeNativeImplementations.ts`. Only codegen-supported types: `string`, `number`, `boolean`, object literals, arrays, `Promise<T>`, and callbacks. Return a `Promise` for anything that resolves from a user interaction.

```typescript
export interface Spec extends TurboModule {
  showConfirmDialog(
    title: string,
    message: string,
    confirmText: string,
    cancelText: string
  ): Promise<boolean>;
}
```

Arguments are positional primitives, not an options object — the callback-shaped API is added later in the JS wrapper. Do not make spec parameters optional; apply defaults in the wrapper instead.

## 2 and 3. Platform-split JS wrappers

Metro picks `.native.ts` on iOS and Android and `.ts` on web. Both files export the same function name and the same options type.

`src/<method>.native.ts` calls the TurboModule and converts the promise into callbacks, so callers never handle a rejection:

```typescript
import NativeImplementations from './NativeNativeImplementations';

export function showConfirmDialog({
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onPress,
  onCancel,
}: ShowConfirmDialogOptions): void {
  NativeImplementations.showConfirmDialog(title, message, confirmText, cancelText)
    .then((confirmed) => (confirmed ? onPress() : onCancel?.()))
    .catch(() => {
      // Native reject (e.g. no activity) means the dialog never appeared.
    });
}
```

`src/<method>.ts` implements the same signature with a browser equivalent (`showConfirmDialog` falls back to `window.confirm`), guarding for the global being absent. Document any option the web path cannot honour.

The public API is callback-based and returns `void`. Keep the `Promise` internal to the library.

## 4. Export

Re-export from `src/index.tsx` without the `.native` suffix, so Metro resolves the platform variant:

```typescript
export { showConfirmDialog } from './showConfirmDialog';
export type { ShowConfirmDialogOptions } from './showConfirmDialog';
```

## 5. Android

In `android/src/main/java/com/nativeimplementations/NativeImplementationsModule.kt`, override the generated abstract method. The class extends `NativeNativeImplementationsSpec`, which codegen produces from the spec — it is not in the repo, so the file will not compile until codegen has run.

Required patterns, all present in `showConfirmDialog`:

- Reject with a stable code when there is no `currentActivity` (`promise.reject("NO_ACTIVITY", ...)`).
- Touch UI only inside `activity.runOnUiThread { }`.
- Guard resolution with a `settled` flag. A dialog can fire both a button handler and a cancel listener, and resolving a promise twice crashes.

`NativeImplementationsPackage.kt`, `build.gradle` and the `.podspec` need no changes per method.

## 6. iOS

In `ios/NativeImplementations.mm`, implement the matching Objective-C method. Codegen maps the spec to a selector with `resolve:` and `reject:` as the final arguments:

```objc
- (void)showConfirmDialog:(NSString *)title
                  message:(NSString *)message
              confirmText:(NSString *)confirmText
               cancelText:(NSString *)cancelText
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
```

Mirror the Android guarantees: `dispatch_async(dispatch_get_main_queue(), ...)`, reject with `NO_VIEW_CONTROLLER` when `RCTPresentedViewController()` is nil, and a `__block BOOL settled` guard. `ios/NativeImplementations.h` only declares conformance to the generated protocol, so it rarely changes.

## 7. Test

Add `src/__tests__/<method>.test.ts`. Import the `.native` module directly and mock the TurboModule — `TurboModuleRegistry.getEnforcing` throws under Jest:

```typescript
jest.mock('../NativeNativeImplementations', () => ({
  __esModule: true,
  default: { showConfirmDialog: jest.fn() },
}));
```

Cover both resolutions of the native promise and assert the exact positional arguments, including defaults. Await a microtask (`await Promise.resolve()`) so the `.then()` callback runs before the assertions.

## 8. Rebuild

```bash
cd libraries/native-implementations
npx jest && npx tsc && npx eslint "src/**/*.{ts,tsx}"
npx bob build   # app/ consumes lib/module/, not src/
```

Use `npx` here, not `yarn`. This package pins Yarn 4 via `yarnPath` in its own `.yarnrc.yml` while its `node_modules` was not installed by Berry, so `yarn <script>` fails with `Couldn't find the node_modules state file`.

Then rebuild the consumer natively. Codegen runs during the app build, not during `prepare`, so a JS reload will not pick up a new native method:

```bash
cd app/ios && pod install     # iOS
yarn workspace app android    # Android — Gradle reruns codegen
```

## Consuming from `app/`

Never import the library from a screen or component. Add it to `app/src/infrastructure/adapters/NativeDialogAdapter.ts`, the single file in the app that imports `react-native-native-implementations`. The adapter owns the Spanish copy, the button labels and amount formatting; the screen passes data and callbacks.

New native dependencies also need a Jest mock in `app/__mocks__/` registered in `moduleNameMapper` in `app/jest.config.js`, or unrelated suites fail on untransformed ESM.

## Documentation

Update `libraries/native-implementations/README.md` with a usage snippet, the native behaviour per platform, the default labels and any web limitation. If the method changes app behaviour, also update `docs/spec/05-native-library.md`, `docs/spec/06-acceptance-criteria.md` and `docs/spec/08-traceability.md`.
