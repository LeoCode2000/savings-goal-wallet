# ADR-006 — Load the WebView from the Vite Development Server

**Date:** 2026-08-20
**Status:** Accepted

## Context

The web micro-app is an independent Vite workspace, but the React Native app
previously built it as a single HTML file, generated a TypeScript string and
embedded that string in the WebView. Every web change required a manual
`yarn sync:web`, and stale generated output could hide changes.

## Decision

`GoalDetailScreen` loads the micro-app by URL. Development uses
`http://localhost:5173/`, configured centrally in
`app/src/infrastructure/config/webViewConfig.ts`.

Vite owns the web development lifecycle and runs with a fixed strict port.
Android reaches the host through `adb reverse tcp:5173 tcp:5173`; the iOS
simulator resolves `localhost` directly.

The generated `goalDetailHtml.ts`, its synchronization script and the
single-file Vite plugin are removed.

## Alternatives Considered

| Alternative | Rejected because |
|-------------|-----------------|
| Keep generating a single HTML string | Requires regeneration, duplicates build output in the app and provides no HMR |
| Package the Vite build as native Android/iOS assets | Supports offline release builds but adds platform-specific copy and URI handling |
| Use a platform-specific default host | `adb reverse` lets Android and the iOS simulator share `localhost`; physical devices can override the central host |

## Trade-offs

- Development requires the Vite server to be running.
- Android requires `adb reverse` after reconnecting the device or emulator.
- Physical iOS devices must use the development machine's LAN address.
- Release builds need an HTTPS-hosted web app configured in
  `webViewConfig.ts`; no offline HTML fallback remains.

## Consequences

- Web changes appear in the WebView through Vite HMR without rebuilding the app.
- The web package can use a normal multi-file production build.
- A failed web-server connection is shown as an explicit Spanish error state.
