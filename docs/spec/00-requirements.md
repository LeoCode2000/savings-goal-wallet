# 00 — Requirements

## Functional Requirements

| ID | User Story | Priority |
|----|-----------|----------|
| HU1 | As a user I want to see a list of my savings goals showing name, target amount, accumulated amount and progress percentage | P0 |
| HU2 | As a user I want to open a goal's detail. Detail and deposit form render inside a WebView | P0 |
| HU3 | As a user I want the global state to update and the list to reflect the new accumulated amount when I confirm a deposit from the web — without reloading the app | P0 |
| HU4 | As a user I want to receive a native confirmation when a goal reaches 100% | P1 |

## Non-Functional Requirements

| ID | Requirement |
|----|------------|
| NFR-01 | React Native 0.81+ / React 19 |
| NFR-02 | TypeScript strict mode — no unnecessary `any` |
| NFR-03 | Redux Toolkit as global state source of truth |
| NFR-04 | WebView communication exclusively via `postMessage` (bidirectional) |
| NFR-05 | Domain layer must be independent of RN, Redux, WebView and native modules |
| NFR-06 | No real backend — mock / in-memory data is allowed |
| NFR-07 | No real credentials, tokens or PII |
| NFR-08 | Tests required in `app/` covering domain, use cases, Redux and the postMessage adapter |
| NFR-09 | Native library must be a separate package (`libreria/`) — deferred, not in P0 scope |

## Constraints

- Created with `@react-native-community/cli` — no Expo
- Monorepo structure: `web/`, `libreria/`, `mobile/` (app), `docs/`
- `web/` does not require tests
- Currency unit: Colombian Pesos (integers, no decimals) — **[ASSUMPTION]**
