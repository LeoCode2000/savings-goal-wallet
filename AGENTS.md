# AGENTS.md

Savings Goal Wallet — a React Native 0.81 / React 19 monorepo. A native list screen, a WebView-hosted deposit form, Redux Toolkit state, and a TurboModule library for native dialogs.

The specs in `docs/` are the source of truth for behaviour. Read the relevant one before changing a layer.

## Monorepo layout

Yarn workspaces: `app`, `web`, `libraries/*`.

| Path | Workspace | Role |
|------|-----------|------|
| `app/` | `app` | React Native app (`@react-native-community/cli`, no Expo) |
| `web/` | `savings-goal-web` | Vite micro-app rendered inside the WebView |
| `libraries/native-implementations/` | `react-native-native-implementations` | TurboModule package for native dialogs |
| `docs/` | — | Specs, ADRs, development plan, AI usage log |
| `scripts/sync-web.js` | — | Generates `app/src/web/goalDetailHtml.ts` from the web build |

## Commands

```bash
yarn workspace app test          # Jest — the primary gate
yarn workspace app lint          # ESLint — the other gate
yarn workspace app start         # Metro
yarn workspace app android       # or: ios
yarn sync:web                    # from root: build web/ and regenerate the inlined HTML
yarn workspace savings-goal-web dev   # Vite dev server for the WebView UI
```

After changing `libraries/native-implementations/src/`, rebuild the library — `app/` consumes the compiled `lib/module/`, not `src/`:

```bash
cd libraries/native-implementations
npx bob build     # rebuild lib/module and lib/typescript
npx jest          # library tests
npx tsc           # library typecheck
```

Use `npx` inside that package, not `yarn`. It pins Yarn 4 through `yarnPath` in its own `.yarnrc.yml`, but its `node_modules` was not installed by Berry, so any `yarn <script>` there fails with `Couldn't find the node_modules state file`. The root monorepo is Yarn 1.

`npx tsc --noEmit` in `app/` is clean, as is the typecheck in `web/` and `libraries/native-implementations/`. Lint and Jest remain the gates, but a new type error means you introduced it.

## Architecture

Lean Clean Architecture with DDD tactical patterns. Dependencies point inward only: Presentation → Application → Domain, with Infrastructure implementing the Domain's interfaces. See `docs/architecture.md`.

| Layer | Path | May import |
|-------|------|-----------|
| Domain | `app/src/domain/` | Nothing outside `domain/` — no React Native, Redux, WebView or native modules |
| Application | `app/src/application/` | Domain only; receives dependencies as parameters (no IoC container) |
| Infrastructure | `app/src/infrastructure/` | Domain and Application (implements their ports) |
| Presentation | `app/src/presentation/` | Application and Infrastructure |

Non-negotiable rules:

- **Business rules live in Domain.** Never in reducers, components or hooks.
- **Redux is a projection layer, not domain.** Reducers are pure state transformations with zero business logic. No thunks, no sagas, no `createAsyncThunk` — async orchestration belongs in use cases. See `docs/spec/04-redux.md`.
- **External boundaries get an adapter.** Raw WebView messages and the native dialog module are reached only through `app/src/infrastructure/adapters/`. Presentation never touches `event.nativeEvent.data` or imports the native library directly.
- **Errors are values, not exceptions.** Use `Result<T, E>` with the `ok` / `err` helpers from `app/src/domain/errors/DomainErrors.ts` and discriminated unions keyed on `kind`.

## Conventions

- TypeScript strict; avoid `any`.
- Value objects are built through factory functions that validate invariants (`createMoney`, `createGoalId`, `createSavingsGoal`), with branded types for identifiers.
- Domain updates are immutable: return a new instance plus any emitted event, never mutate in place.
- Amounts are Colombian Pesos as integers, no decimals. Format for display as `` `$${value.toLocaleString('es-CO')}` ``.
- User-facing copy is Spanish. Identifiers, comments, commit messages and docs are English.
- Comments only explain non-obvious intent or constraints. Don't narrate what the code does.
- `app/src/web/goalDetailHtml.ts` is auto-generated. Never edit it by hand.
- Commit messages follow Conventional Commits, e.g. `feat(domain): ...`, `test: ...`, `docs(spec): ...`.

## Testing

Jest 29 with the `react-native` preset; config in `app/jest.config.js`. Tests live in `app/__tests__/` mirroring the `src/` layers. See `docs/spec/07-test-strategy.md`.

- Test behaviour, not implementation. Keep tests isolated (fresh in-memory repo per test) and free of I/O and timers.
- Third-party and native modules are mocked through `moduleNameMapper` pointing at `app/__mocks__/`. A new native dependency needs a mock there or it will break unrelated suites, because packages resolving to untransformed ESM fail to parse.
- `web/` has no tests by design.
- `GoalDetailScreen`'s WebView integration is not unit tested; it needs a device. Verify it manually.

## Documentation upkeep

When behaviour changes, keep the specs honest:

- `docs/spec/06-acceptance-criteria.md` — add or amend the acceptance criterion.
- `docs/spec/08-traceability.md` — one row per requirement linking story, use case, criterion, test and implementation.
- `docs/adr/` — a new ADR for an architectural decision; don't rewrite history in an accepted one.
- `docs/ia/USO_IA.md` — log AI-assisted work, rejections and corrections.

Claims in the specs must match reality. Don't credit a test with coverage it doesn't have.

## Gotchas

- Editing `web/src/` has no effect on the app until `yarn sync:web` regenerates the inlined HTML. This fails silently — the app keeps rendering the old bundle.
- Adding a method to the TurboModule spec requires native codegen plus a rebuild (`pod install` for iOS, Gradle for Android). Reloading the JS bundle is not enough. Changes confined to the library's TypeScript need only `prepare`.
- `useGoals` holds a module-level singleton `InMemoryGoalRepository`. State resets on app restart, and it is shared across renders.
- `selectAllGoals` must stay memoised with `createSelector`; returning a fresh array triggers react-redux v9 warnings and a non-zero exit code.
- The `GoalCompleted` event fires only on the deposit that crosses 100%, never again for an already-completed goal.
- `lefthook.yml` is still the unmodified template with everything commented out. There are no active git hooks.
