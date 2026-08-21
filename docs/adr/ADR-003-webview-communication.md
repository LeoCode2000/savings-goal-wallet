# ADR-003 — WebView Communication

**Date:** 2026-08-20
**Status:** Accepted

## Context

The spec requires bidirectional communication between the React Native shell and the WebView micro-app exclusively via `postMessage`. Raw postMessage data is an untyped, untrusted external boundary.

## Decision

All WebView communication is mediated by `WebViewMessageAdapter`. The Application layer never receives raw strings or `event` objects.

- **Discriminated union types** (`WebToNativeMessage`, `NativeToWebMessage`) define the contract
- **Adapter pattern** validates JSON, discriminates type, validates payload shape, and returns `Result<TypedMessage, ParseError>`
- **All parse errors are explicit** — no silent type-casting with `as`

## Why

Without the adapter, validation and type-casting would scatter across components. The adapter is a natural seam for testing — all 9 edge cases (invalid JSON, unknown type, missing fields, bad amounts) are unit-tested without mounting any component.

## Alternatives Considered

| Alternative | Rejected because |
|-------------|-----------------|
| `JSON.parse` inline in component + manual checks | Untestable, scattered validation |
| Zod / Yup schema validation | Valid, but adds a dependency for what 40 lines of TypeScript covers |
| Event bus / custom EventEmitter | Adds indirection; postMessage is already the contract |

## Trade-offs

- Requires running `yarn sync:web` when the web app changes
- `GOAL_UPDATED` message type is defined in the contract but not yet sent by the native side after deposits — a future improvement

## Consequences

- The entire parsing boundary is covered by 9 unit tests
- The web contract can evolve independently of the app internals
- Adding a new message type requires changes only in the contract file and adapter — no component changes
