# ADR-002 — State Management

**Date:** 2026-08-20
**Status:** Accepted

## Context

The spec requires Redux as the global state source of truth. The challenge is how to integrate Redux without letting it absorb business logic.

## Decision

Redux Toolkit is the state management layer. It acts as a **projection** of application state, not as an orchestrator of business logic.

- No `createAsyncThunk` — async orchestration lives in use cases
- No business rules in reducers — reducers are pure state transformations
- Selectors are memoised with `createSelector` to avoid unnecessary re-renders

## Why

Redux Toolkit reduces boilerplate. Keeping Redux as infrastructure (not domain) means use cases remain testable without a store. The `GoalRecord` type (plain serialisable object) intentionally strips branded types to be DevTools-compatible.

## Alternatives Considered

| Alternative | Rejected because |
|-------------|-----------------|
| `createAsyncThunk` for deposit | Would move orchestration into Redux; Application layer loses cohesion |
| Zustand / Jotai | Not specified; Redux is a hard requirement |
| Redux-Saga | Unnecessary complexity for three use cases |

## Consequences

- Redux reducers are trivially testable (pure functions)
- Use cases are independently testable without Redux
- Hook (`useGoals`) is the seam between Application and Redux — it's the only place that calls both
