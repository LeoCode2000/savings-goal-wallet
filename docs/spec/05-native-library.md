# 05 — Native Library

> **Status: P1 — deferred.** The `libreria/` package is designed but not yet implemented. P0 (HU1, HU2, HU3) is complete. This document captures the decision for when implementation resumes.

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

```typescript
showConfirmDialog(options: {
  title: string;
  message: string;
}): Promise<boolean>
```

**Why:**
- Exposes real Kotlin code (`AlertDialog.Builder`) — demonstrates native authoring
- Clean, typed JS contract — ideal TurboModule candidate
- Mockable in unit tests with a single `jest.mock()`
- Directly satisfies HU4 (goal completion confirmation)
- Does not depend on React Native's own `Alert.alert` (which doesn't count as custom native code)

**Current P0 fallback:** `Alert.alert()` in `GoalDetailScreen` — this is the placeholder until `libreria/` is implemented.

---

## Planned TurboModule Spec (`libreria/`)

```
libreria/
├── package.json           # name: "rn-savings-native", react-native-builder-bob
├── src/
│   ├── NativeSavingsModule.ts   # TurboModule spec (codegen input)
│   └── index.ts                 # public API
├── android/
│   └── src/main/kotlin/
│       └── SavingsModule.kt     # AlertDialog.Builder implementation
├── ios/
│   └── SavingsModule.mm         # UIAlertController stub
├── __tests__/
│   └── SavingsModule.test.ts
└── README.md
```

**TurboModule registration** follows the `react-native-builder-bob` template with `codegenConfig` in `package.json`.

---

## Integration with `app/`

```typescript
// app/src/infrastructure/adapters/NativeLibraryAdapter.ts
import SavingsNative from 'rn-savings-native';

export async function showGoalCompletedDialog(goalName: string): Promise<void> {
  await SavingsNative.showConfirmDialog({
    title: '¡Meta completada!',
    message: `Alcanzaste tu meta "${goalName}". ¡Felicitaciones!`,
  });
}
```

The `MakeDeposit` use case receives this as an injected `onGoalCompleted` callback — no direct dependency on the native module from the domain or application layers.
