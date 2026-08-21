# 07 — Test Strategy

## Philosophy

Quality over coverage percentage. Tests must be:
- **Isolated** — no shared mutable state between tests
- **Fast** — no I/O, no timers unless strictly necessary
- **Meaningful** — test behaviour, not implementation details

## What is tested

### Domain (`__tests__/domain/`)
- `createSavingsGoal` — initial state, progress calculation, completion flag
- `applyDeposit` — success path, error paths (zero, negative, non-finite), `GoalCompleted` event emission, no double-emit on already-completed goal, progress cap at 1.0

### Application (`__tests__/application/`)
- `MakeDeposit` — success, repository persistence, `GoalNotFound`, invalid amount, `onGoalCompleted` callback, no callback on partial deposit

### Infrastructure — Redux (`__tests__/infrastructure/goalsSlice.test.ts`)
- Every action: `goalsLoaded`, `depositStarted`, `depositConfirmed`, `depositFailed`, `depositReset`, `goalSelected`
- Initial state shape

### Infrastructure — Selectors (`__tests__/infrastructure/selectors.test.ts`)
- `selectAllGoals` — returns array
- `selectGoalById` — found and not found
- `selectDepositStatus` — reflects current value

### Infrastructure — WebView Adapter (`__tests__/infrastructure/WebViewMessageAdapter.test.ts`)
- Valid `DEPOSIT_CONFIRMED`
- Valid `WEB_READY`
- Invalid JSON
- Unknown type
- Invalid payload: missing `goalId`, empty `goalId`, zero amount, negative amount, non-finite amount (`Infinity`), missing payload entirely

### Presentation (`__tests__/App.test.tsx`)
- Smoke test — app renders without crashing

## What is NOT tested

| Area | Reason |
|------|--------|
| `web/` | Specified as out of scope |
| `GoalDetailScreen` WebView integration | Requires device/emulator; mocked in unit boundary |
| `libreria/` | Not yet implemented (P1) |
| Navigation | Inline state machine — covered by App smoke test |

## Tools

| Tool | Purpose |
|------|---------|
| Jest 29 | Test runner |
| `react-test-renderer` | Component smoke tests |
| `react-native` preset | Transform + RN module mocking |
| Custom `__mocks__/` | `react-native-webview`, `react-native-safe-area-context` |

## Running Tests

```bash
# from app/
yarn test

# from monorepo root
yarn workspace app test
```
