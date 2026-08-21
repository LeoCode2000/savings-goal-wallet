# 01 — Domain Model

## Entities

### SavingsGoal
Single aggregate root. Identity is defined by `GoalId`.

| Property | Type | Description |
|----------|------|-------------|
| `id` | `GoalId` | Branded string — primary identifier |
| `name` | `string` | Human-readable name |
| `targetAmount` | `Money` | Savings target |
| `accumulatedAmount` | `Money` | Current total deposited |
| `progress` | `Progress` | Derived — never stored independently |
| `isCompleted` | `boolean` | Derived — `accumulated >= target` |

**Invariants**
- `targetAmount.amount > 0` — enforced at construction
- `accumulatedAmount.amount >= 0`
- `progress.ratio = min(accumulated / target, 1.0)`

**Behaviour**
- `applyDeposit(amount) → Result<DepositResult, DomainError>` — returns new immutable instance + optional `GoalCompleted` event

---

## Value Objects

### Money
```
amount: number  — positive finite integer (COP)
```
**Invariants**
- `amount > 0` — validated by `createMoney()`
- `Number.isFinite(amount)` must be true

### Progress
```
ratio:      number  — [0.0, 1.0] capped
percentage: number  — Math.round(ratio * 100)
```
Calculated via `calculateProgress(accumulated, target)`. Never constructed directly.

### GoalId
Branded `string` — non-empty, trimmed. Enforced by `createGoalId()`.

---

## Domain Events

### GoalCompleted
```typescript
{
  kind: 'GoalCompleted'
  goalId: string
  goalName: string
  finalAmount: number
}
```
Emitted by `applyDeposit` when `isNowCompleted && !goal.isCompleted` (transition only, not on every deposit to an already-completed goal).

---

## Business Rules

| Rule | Behaviour |
|------|-----------|
| `deposit <= 0` | `err({ kind: 'InvalidDepositAmount' })` |
| `deposit` is not finite | `err({ kind: 'InvalidDepositAmount' })` |
| `targetAmount <= 0` | `err({ kind: 'InvalidTargetAmount' })` at construction |
| Goal not found by id | `err({ kind: 'GoalNotFound' })` — raised in Application layer |
| `deposit > remaining` | Allowed — goal becomes completed, progress caps at 1.0 — **[ASSUMPTION]** |
| Goal already completed | Deposit is still applied, `GoalCompleted` event is NOT re-emitted — **[ASSUMPTION]** |
| Multiple deposits | Each deposit is independent; total is cumulative |

---

## Dependency Rules

| Layer | Allowed dependencies | Forbidden |
|-------|---------------------|-----------|
| Domain | None (pure TypeScript) | React Native, Redux, WebView, any native module |
