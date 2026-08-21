# 02 — Use Cases

## UC-01 · GetGoals

| Field | Value |
|-------|-------|
| **Input** | none |
| **Output** | `SavingsGoal[]` |
| **Preconditions** | Repository contains seed data |
| **Business Rules** | None — pure read |
| **Success** | Returns all goals ordered by insertion |
| **Failure** | Repository error → propagated as exception |
| **Side Effects** | None |
| **Dependencies** | `GoalRepository` |

---

## UC-02 · MakeDeposit

| Field | Value |
|-------|-------|
| **Input** | `{ goalId: string, amount: number }` |
| **Output** | `Result<SavingsGoal, DepositError>` |
| **Preconditions** | Goal with `goalId` must exist |
| **Business Rules** | Delegates to `applyDeposit` — see domain rules |
| **Success** | Returns updated goal; goal is persisted; Redux action dispatched externally |
| **Failure** | `GoalNotFound` · `InvalidDepositAmount` · `RepositoryError` |
| **Side Effects** | If `GoalCompleted` event is emitted → calls `onGoalCompleted` callback (HU4) |
| **Dependencies** | `GoalRepository`, optional `onGoalCompleted` handler |

**Flow**
```
MakeDeposit(input, deps)
  → repository.getById(goalId)         // null → GoalNotFound
  → domain.applyDeposit(goal, amount)  // invalid → DomainError
  → repository.save(updatedGoal)
  → deps.onGoalCompleted(event)?       // only if GoalCompleted was emitted
  → ok(updatedGoal)
```

---

## UC-03 · HandleWebMessage

| Field | Value |
|-------|-------|
| **Input** | `rawString: string` (from `event.nativeEvent.data`) |
| **Output** | `void` — triggers internal actions |
| **Preconditions** | WebView is mounted |
| **Business Rules** | None in this use case — delegates to `MakeDeposit` |
| **Success** | `DEPOSIT_CONFIRMED` → `MakeDeposit` → Redux update |
| **Failure** | Invalid JSON · unknown type · invalid payload → silently dropped (logged in production) |
| **Side Effects** | On `WEB_READY` → sends `SESSION_INIT` back to web |
| **Dependencies** | `WebViewMessageAdapter`, `MakeDeposit` |

**Flow**
```
raw string
  → WebViewMessageAdapter.parseWebViewMessage(raw)
      → InvalidJson?         → drop
      → UnknownMessageType?  → drop
      → InvalidPayload?      → drop
  → typed WebToNativeMessage
      → WEB_READY            → sendSessionInit()
      → DEPOSIT_CONFIRMED    → MakeDeposit(payload)
```

---

## UC-04 · NotifyGoalCompleted *(P1 — deferred)*

| Field | Value |
|-------|-------|
| **Input** | `GoalCompletedEvent` |
| **Output** | `void` |
| **Notes** | Invoked as `onGoalCompleted` callback from UC-02. Currently implemented via `Alert.alert`. Native library (`libreria/`) would replace this with a real `AlertDialog` via TurboModule |
