# ADR-005 — Testing Strategy

**Date:** 2026-08-20
**Status:** Accepted

## Context

The spec requires tests in `app/` and `libreria/`. Quality matters more than coverage percentage. Tests must be fast, isolated and meaningful.

## Decision

Unit tests only for P0 scope. No integration tests or E2E tests. Six test suites covering the three core layers: Domain, Application, Infrastructure.

## Why Unit Tests Only

- The domain and use cases are pure functions — unit tests give maximum confidence with minimum setup
- The WebView adapter is a pure parsing function — all edge cases are fully coverable by unit tests
- Component integration tests would require more mock infrastructure than the components themselves contain logic
- E2E tests require a device/emulator — out of scope for a demo challenge

## Jest Configuration Decisions

| Decision | Reason |
|----------|--------|
| `transformIgnorePatterns` for `react-redux`, `@reduxjs/toolkit`, `immer` | These packages ship ESM; must be transpiled by Babel for Jest (CommonJS environment) |
| `moduleNameMapper` for `react-native-webview` | Native module — no JS implementation to import in Node.js |
| `moduleNameMapper` for `react-native-safe-area-context` | Same — native context provider |
| `createSelector` for `selectAllGoals` | Avoids react-redux v9 unstable-selector warning that caused false exit code 1 |

## What is Deliberately Not Tested

| Area | Rationale |
|------|-----------|
| `web/` micro-app | Specified as out of scope |
| Navigation | Inline state machine with two states — covered by smoke test |
| `GoalDetailScreen` WebView behaviour | Requires device; isolated by adapter tests |
| `libreria/` | P1 — not implemented |

## Consequences

- All 36 tests run in under 3 seconds
- Domain tests have zero React Native imports — runnable in any Node.js environment
- Adding the native library (P1) requires adding tests only in `libreria/__tests__/`
