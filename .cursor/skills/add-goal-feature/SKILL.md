---
name: add-goal-feature
description: Implements a feature in the React Native app as a vertical slice across the Domain, Application, Infrastructure and Presentation layers, enforcing the Clean Architecture dependency rules, Result-based error handling, Redux as a pure projection layer, and the spec and traceability updates. Use when adding or changing app behaviour such as a business rule, use case, Redux action, selector, screen or hook, or when the user mentions domain, use case, entity, value object, repository, slice or layer boundaries in app/.
---

# Adding a feature to `app/`

Build features as a vertical slice from the inside out: Domain first, then Application, Infrastructure, Presentation. Each layer is tested before the next one depends on it. Architecture rationale is in `docs/architecture.md`; layer contracts are in `docs/spec/01-domain.md`, `02-use-cases.md` and `04-redux.md`.

## Dependency rules

```
Presentation  →  Application  →  Domain
                                   ↑
                        Infrastructure implements its ports
```

| Layer | Path | May import |
|-------|------|-----------|
| Domain | `app/src/domain/` | Nothing outside `domain/` |
| Application | `app/src/application/` | Domain only |
| Infrastructure | `app/src/infrastructure/` | Domain, Application |
| Presentation | `app/src/presentation/` | Application, Infrastructure |

A single React Native, Redux, WebView or native-module import inside `app/src/domain/` breaks NFR-05. Domain must be testable with no React Native installed.

## 1. Domain

Business rules go here and nowhere else. Entities and value objects are plain readonly types with factory functions that enforce invariants — no classes, no decorators.

- Value objects (`Money`, `Progress`, `GoalId`) validate on construction. `GoalId` is a branded string.
- Derived state (`progress`, `isCompleted`) is computed, never stored independently.
- Mutations return a **new** object plus any emitted event, as `applyDeposit` does:

```typescript
export function applyDeposit(
  goal: SavingsGoal,
  rawAmount: number,
): Result<DepositResult, DomainError> {
  const moneyResult = createMoney(rawAmount);
  if (!moneyResult.ok) {
    return err(moneyResult.error);
  }
  // ... returns { updatedGoal, event }
}
```

Errors are values. Add a variant to the `DomainError` union in `app/src/domain/errors/DomainErrors.ts` and return `err({ kind: 'MyError', ... })`. Never throw for an expected failure, and never return a bare `null` to mean "invalid".

Domain events are plain objects with a `kind` discriminator, emitted only on a state transition. `GoalCompleted` fires on the deposit that crosses 100% and never again — replicate that guard style (`isNowCompleted && !goal.isCompleted`) for any new event.

Amounts are Colombian Pesos as integers, no decimals.

## 2. Application

Use cases in `app/src/application/useCases/` orchestrate the domain and the repository. They receive dependencies as a parameter — there is no IoC container.

```typescript
type MakeDepositDeps = {
  repository: GoalRepository;
  onGoalCompleted?: (event: GoalCompletedEvent) => void;
};

export async function makeDeposit(
  input: DepositInput,
  deps: MakeDepositDeps,
): Promise<DepositOutput> { ... }
```

Use cases return `Result<T, E>`, propagate domain errors unchanged, and delegate every rule to the domain. Side effects reach the outside world through injected callbacks — that is how a native dialog is triggered without the application layer knowing the native module exists.

Storage is reached only through the `GoalRepository` port in `app/src/application/ports/`.

## 3. Infrastructure

**Redux is a projection layer, not domain.** Reducers in `goalsSlice.ts` are pure state transformations with zero business logic.

- `GoalRecord` is the serialisable projection of `SavingsGoal`: plain numbers, no branded types, so DevTools and `redux-persist` work without custom middleware. Convert with `toGoalRecord`.
- `goals` is keyed by id for O(1) lookup.
- Selectors returning a new array or object **must** be memoised with `createSelector`, or react-redux v9 warns and the process exits non-zero.
- No thunks, no sagas, no `createAsyncThunk`. Async orchestration lives in use cases; the hook dispatches synchronous actions from the result.
- A status field follows the `'idle' | 'loading' | 'success' | 'error'` shape with a matching started/confirmed/failed/reset action set.

Adapters in `app/src/infrastructure/adapters/` wrap untrusted or platform-specific boundaries: `WebViewMessageAdapter` validates inbound `postMessage` data, `NativeDialogAdapter` is the only file importing the native dialog library. Add new external dependencies as adapters, not as direct imports from Presentation.

## 4. Presentation

Screens and components in `app/src/presentation/` stay thin: read state with `useSelector`, call use cases through the `useGoals` hook, render.

- `useGoals` is the seam between use cases and Redux. It dispatches `depositStarted`, awaits the use case, then dispatches `depositConfirmed` or `depositFailed`.
- Navigation is an inline `useState` machine in `app/App.tsx` — no React Navigation. A new screen is a variant of the `Screen` union plus a branch in `AppNavigator`.
- User-facing copy is Spanish; identifiers and comments are English.
- Format amounts as `` `$${value.toLocaleString('es-CO')}` ``.
- Wrap `switch` cases that declare consts in braces. ESLint does not enforce this here, but without them the bindings are scoped to the whole `switch` and collide across cases.

## 5. Tests

Tests live in `app/__tests__/` mirroring the `src/` layers. See `docs/spec/07-test-strategy.md`.

| Layer | What to cover |
|-------|---------------|
| Domain | Invariants, every business rule, each error path, event emission and non-emission |
| Application | Success, persistence, each error variant, injected callbacks fired and not fired |
| Redux | Every action and the initial state shape |
| Selectors | Found and not-found cases |
| Adapters | Valid input plus every rejection case |

Keep tests isolated with a fresh in-memory repository per test, and free of I/O and timers. Test behaviour, not implementation details.

```bash
yarn workspace app test
yarn workspace app lint
```

Both must pass. Ignore `npx tsc --noEmit`: it reports four errors that predate any current change.

## 6. Documentation

Update the specs in the same change:

- `docs/spec/01-domain.md` — new entity, value object, event or business rule.
- `docs/spec/02-use-cases.md` — a use case table plus its flow.
- `docs/spec/04-redux.md` — new action or selector.
- `docs/spec/06-acceptance-criteria.md` — the acceptance criterion and how it is verified.
- `docs/spec/08-traceability.md` — one row linking requirement, story, use case, rule, criterion, test and implementation.
- `docs/adr/` — a new ADR when the decision is architectural. Don't rewrite an accepted one.

State only coverage that actually exists.
