# Development Plan

## M0 — Specification ✅
**Goal:** Define architecture, contracts and acceptance criteria before writing any code.

Tasks:
- [x] Architecture decision
- [x] Domain model spec
- [x] Use case spec
- [x] WebView contract spec
- [x] Redux spec
- [x] Native library option analysis
- [x] Acceptance criteria
- [x] Test strategy
- [x] Traceability matrix
- [x] ADRs

Definition of Done: All `docs/spec/` files exist and reviewed.
Commit: `docs(spec): define savings goal domain and architecture`

---

## M1 — Project Bootstrap ✅
**Goal:** Working RN project with TypeScript, Redux Toolkit, react-native-webview.

Tasks:
- [x] Create app with `@react-native-community/cli`
- [x] Install dependencies (Redux Toolkit, react-redux, react-native-webview, react-native-safe-area-context)
- [x] Configure TypeScript strict mode
- [x] Configure Jest (transformIgnorePatterns for ESM packages, mocks)
- [x] Create monorepo root `package.json`

Definition of Done: `yarn test` passes with 0 failures.
Commit: `chore(bootstrap): init RN 0.81 project with Redux and WebView`

---

## M2 — Domain ✅
**Goal:** Pure domain layer — entities, value objects, business rules, domain events.

Tasks:
- [x] `SavingsGoal` entity + `createSavingsGoal` + `applyDeposit`
- [x] `Money` value object + `createMoney` + `addMoney`
- [x] `Progress` value object + `calculateProgress`
- [x] `GoalId` branded type
- [x] `DomainError` discriminated union + `Result<T,E>`
- [x] `GoalCompleted` domain event
- [x] Domain tests

Definition of Done: All domain tests pass; zero imports from RN/Redux/WebView in `src/domain/`.
Commit: `feat(domain): implement savings goal with deposit and completion rules`

---

## M3 — Application ✅
**Goal:** Use cases orchestrating domain and repository port.

Tasks:
- [x] `GoalRepository` interface (port)
- [x] `GetGoals` use case
- [x] `MakeDeposit` use case
- [x] `MakeDeposit` tests

Definition of Done: Use case tests pass with in-memory repo stub.
Commit: `feat(application): implement GetGoals and MakeDeposit use cases`

---

## M4 — Redux ✅
**Goal:** Global state slice — goals, deposit status.

Tasks:
- [x] `goalsSlice` (actions + reducers)
- [x] `selectors` (with `createSelector` memoisation)
- [x] `store` configuration
- [x] Redux tests

Definition of Done: All slice and selector tests pass.
Commit: `feat(redux): add goals slice with deposit status and memoised selectors`

---

## M5 — WebView Contract ✅
**Goal:** Typed bidirectional postMessage contract and adapter.

Tasks:
- [x] `WebViewMessageContract.ts` (discriminated unions)
- [x] `WebViewMessageAdapter.ts` (parse + validate)
- [x] Adapter tests (9 cases including edge cases)

Definition of Done: All adapter tests pass; Application layer has no reference to `event.nativeEvent.data`.
Commit: `feat(webview): add typed postMessage contract and validation adapter`

---

## M6 — Web Micro-app ✅
**Goal:** Standalone web package at monorepo root.

Tasks:
- [x] `web/index.html` — goal detail + deposit form
- [x] `web/package.json`
- [x] Vite dev server on a fixed port
- [x] `webViewConfig.ts` — central WebView host and port

Definition of Done: the web app renders in the browser and the native WebView
loads it from the Vite server through `adb reverse`.
Commit: `feat(web): serve WebView micro-app from Vite`

---

## M7 — Integration ✅
**Goal:** Wire all layers together — presentation, hooks, navigation.

Tasks:
- [x] `InMemoryGoalRepository` with seed data
- [x] `useGoals` hook (connects use cases ↔ Redux)
- [x] `GoalCard` component
- [x] `GoalListScreen`
- [x] `GoalDetailScreen` (Vite URL host + bidirectional postMessage)
- [x] `App.tsx` (Provider + inline navigation)

Definition of Done: App renders list; tapping opens WebView detail; deposit updates list.
Commit: `feat(mobile): integrate all layers — list, detail, deposit flow`

---

## M8 — Testing ✅
**Goal:** Full test suite — 36 tests across 6 suites.

Tasks:
- [x] Domain tests
- [x] Application tests
- [x] Redux tests
- [x] Selector tests
- [x] WebView adapter tests
- [x] App smoke test

Definition of Done: `yarn test` exits 0, all suites green.
Commit: `test: achieve full coverage of domain, application, redux and adapter`

---

## M9 — Documentation ✅
**Goal:** All planned `docs/` files exist and are accurate.

Tasks:
- [x] `docs/spec/00–08`
- [x] `docs/architecture.md`
- [x] `docs/development-plan.md`
- [x] `docs/adr/ADR-001–006`
- [x] `docs/ia/USO_IA.md`

---

## M10 — Native Library *(P1 — deferred)*
**Goal:** `libreria/` package with TurboModule `showConfirmDialog`.

Tasks:
- [ ] Scaffold with `react-native-builder-bob`
- [ ] TurboModule spec + codegen
- [ ] Kotlin `AlertDialog.Builder` implementation
- [ ] iOS `UIAlertController` stub
- [ ] Library tests
- [ ] Consume in `app/` — replace `Alert.alert` fallback

Definition of Done: `showConfirmDialog` opens a native dialog on Android emulator.
Commit: `feat(native): add showConfirmDialog TurboModule in libreria/`
