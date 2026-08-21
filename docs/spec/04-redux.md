# 04 — Redux

## Principle

Redux is **infrastructure**, not domain. Reducers contain zero business logic — they are pure state transformations. Business rules live in Domain. Orchestration lives in Application (use cases). Redux is the projection layer between Application and Presentation.

---

## State Shape

```typescript
type GoalRecord = {
  id: string;
  name: string;
  targetAmount: number;
  accumulatedAmount: number;
  progressRatio: number;
  progressPercentage: number;
  isCompleted: boolean;
};

type GoalsState = {
  goals: Record<string, GoalRecord>; // keyed by id for O(1) lookup
  depositStatus: 'idle' | 'loading' | 'success' | 'error';
  depositError: string | null;
  selectedGoalId: string | null;
};
```

`GoalRecord` is a serialisable projection of `SavingsGoal`. It deliberately uses plain numbers instead of branded value objects so Redux DevTools and serialisation work without custom middleware.

---

## Actions

| Action | Payload | Description |
|--------|---------|-------------|
| `goalsLoaded` | `GoalRecord[]` | Populates store after `GetGoals` |
| `depositStarted` | — | Sets status to `'loading'` |
| `depositConfirmed` | `GoalRecord` | Merges updated goal, sets `'success'` |
| `depositFailed` | `string` (error message) | Sets status to `'error'` |
| `depositReset` | — | Resets status to `'idle'` |
| `goalSelected` | `string` (goalId) | Tracks which goal is open in WebView |

---

## Selectors

| Selector | Returns |
|----------|---------|
| `selectAllGoals` | `GoalRecord[]` — memoised with `createSelector` |
| `selectGoalById(id)` | `GoalRecord \| undefined` |
| `selectDepositStatus` | `'idle' \| 'loading' \| 'success' \| 'error'` |
| `selectDepositError` | `string \| null` |
| `selectSelectedGoalId` | `string \| null` |

`selectAllGoals` uses `createSelector` to avoid returning a new array reference on every call (which would trigger unnecessary re-renders and trigger react-redux v9 warnings).

---

## Async Behaviour

There are no Redux thunks or sagas. Async orchestration lives in use cases (`MakeDeposit`). The hook (`useGoals`) dispatches synchronous actions based on the use case result:

```
useGoals.deposit()
  → dispatch(depositStarted)
  → await makeDeposit(...)
  → result.ok  → dispatch(depositConfirmed(toGoalRecord(result.value)))
  → !result.ok → dispatch(depositFailed(errorMessage))
```

This keeps Redux reducers simple and avoids `createAsyncThunk` boilerplate for a demo scope.

---

## Direction of Data Flow

```
WebView
  → postMessage
  → WebViewMessageAdapter (Infrastructure)
  → HandleWebMessage (Application)
  → MakeDeposit (Application)
  → applyDeposit (Domain)
  → GoalRepository.save (Infrastructure)
  → useGoals hook dispatches Redux actions (Presentation ↔ Infrastructure)
  → GoalListScreen re-renders via useSelector (Presentation)
```
