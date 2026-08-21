# Architecture

## Context

Senior React Native technical challenge: build a "Savings Goal Wallet" feature with a native list screen, a WebView-hosted detail/deposit UI, bidirectional `postMessage` communication, Redux state management, and a separate native library package.

---

## Decision

**Lean Clean Architecture + DDD tactical patterns**

Three explicit dependency layers (Domain → Application → Infrastructure/Presentation) enforced via TypeScript module boundaries. Full hexagonal ports-and-adapters was considered and rejected — see Trade-offs.

```
┌─────────────────────────────────────────┐
│              Presentation               │
│  GoalListScreen · GoalDetailScreen      │
│  GoalCard · useGoals hook               │
└──────────────────┬──────────────────────┘
                   │ calls
┌──────────────────▼──────────────────────┐
│              Application                │
│  GetGoals · MakeDeposit                 │
│  WebView message flow (via adapter/hook)│
└──────────────────┬──────────────────────┘
                   │ uses interfaces from
┌──────────────────▼──────────────────────┐
│                Domain                   │
│  SavingsGoal · Money · Progress         │
│  GoalId · GoalCompleted event           │
│  applyDeposit · business rules          │
└─────────────────────────────────────────┘

Infrastructure (implements domain interfaces)
─────────────────────────────────────────────
Redux (goalsSlice · selectors · store)
InMemoryGoalRepository  → GoalRepository port
WebViewMessageAdapter   → parses raw postMessage
```

---

## Why DDD?

The domain has genuine business rules (`progress = accumulated/target`, deposit validation, goal completion transition). DDD tactical patterns make those rules explicit, testable and independent of any framework. Without DDD, rules would leak into reducers or components.

## Why Clean/Lean Architecture (not full hexagonal)?

Full hexagonal requires explicit `Port` interfaces for every external dependency. For a 30-minute demo this creates unnecessary ceremony. The chosen approach achieves the same dependency inversion via:
- `GoalRepository` interface (port) → `InMemoryGoalRepository` (adapter)
- Use cases receive dependencies by parameter (no IoC container)
- Domain has zero imports from outside its own folder

This is demonstrably senior-level without being over-engineered.

## Why Adapter (postMessage)?

The raw WebView event (`event.nativeEvent.data: string`) is an untrusted external boundary. The `WebViewMessageAdapter` validates, types and transforms it before it reaches application code. This pattern is standard for any integration boundary (API responses, native events, storage reads).

## Why Repository?

`GoalRepository` interface decouples the Application layer from the storage mechanism. Swapping `InMemoryGoalRepository` for a SQLite or API-backed implementation requires zero changes to use cases or domain. This is also what makes use-case tests trivial — inject a fresh in-memory repo per test.

## Why Redux?

Redux is required by the spec. Beyond compliance: it provides a single, observable, time-travelable source of truth for goal state. The list screen reacts to any deposit confirmed from the WebView without prop drilling or event buses.

## Why WebView?

Required by the spec. The architectural insight is that the WebView is a **host boundary** — the native app knows nothing about the web UI's internals, and the web app knows nothing about Redux or native modules. They communicate through a typed contract.

## Why NOT a more complex architecture?

No event bus, no pub-sub, no CQRS, no saga middleware. Each of these was considered and rejected because:
- The feature has one aggregate (SavingsGoal) and three use cases
- Observer/pub-sub would add indirection without reducing coupling
- `createAsyncThunk` would move orchestration into Redux, blurring the Application layer

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Lean arch over full hexagonal | Faster to implement and explain | No formal port interfaces; depends on convention |
| In-memory repo (singleton in hook) | Zero setup, instant tests | State resets between app restarts; not suitable for production |
| Vite micro-app in WebView | Web UI can be developed and built independently | Requires the Vite server during local development |
| TurboModule `showConfirmDialog` | Demonstrates reusable custom native code for HU4 | Native changes require codegen/build steps |
| No `createAsyncThunk` | Redux stays as projection layer | Orchestration lives in hook — slightly less testable at integration level |

---

## Consequences

- Domain is 100% testable without React Native installed
- Swapping the repository implementation is a one-line change in `useGoals`
- `libraries/native-implementations/` (TurboModule) is integrated through `NativeDialogAdapter`; the domain and application layers remain independent of the native module
- The WebView contract is the only coupling between `web/` and `app/` — either side can change its internals freely
