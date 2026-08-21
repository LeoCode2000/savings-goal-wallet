---
name: add-webview-message
description: Adds or changes a postMessage message type in the bidirectional contract between the React Native app and the WebView micro-app, covering the duplicated type unions, adapter validation, both send and receive sites, tests and dev-server verification. Use when changing communication between app/ and web/, when the user mentions postMessage, WebView contract, SESSION_INIT, GOAL_UPDATED, DEPOSIT_CONFIRMED, WEB_READY, or when the web micro-app needs to send or receive new data.
---

# Adding a WebView message type

`app/` and `web/` communicate **exclusively** through `postMessage` with JSON strings. Neither side knows the other's internals — the message contract is the only coupling. See `docs/spec/03-webview-contract.md`.

The contract is declared **twice**, once per workspace, because they are independent packages with no shared types:

| File | Side |
|------|------|
| `app/src/infrastructure/adapters/WebViewMessageContract.ts` | React Native |
| `web/src/types.ts` | Web micro-app |

Both must be edited together. TypeScript will not catch a mismatch — it surfaces at runtime as a silently dropped message.

## Checklist

```
- [ ] 1. Both contract files updated identically
- [ ] 2. Sender implemented
- [ ] 3. Receiver implemented
- [ ] 4. Adapter validation (only for Web → Native)
- [ ] 5. Adapter tests, including rejection cases
- [ ] 6. Dev-server integration verified
- [ ] 7. docs/spec/03-webview-contract.md updated
```

## Direction: Native → Web

The app sends via `webViewRef.current?.postMessage(JSON.stringify(message))`, typed as `NativeToWebMessage`. Existing types are `SESSION_INIT` (sent in response to `WEB_READY`) and `GOAL_UPDATED` (sent after a successful deposit).

1. Add the variant to the `NativeToWebMessage` union in both contract files.
2. Add a `useCallback` sender in `GoalDetailScreen.tsx` next to `sendSessionInit` and `sendGoalUpdated`, building a typed `NativeToWebMessage` object rather than an inline literal.
3. Handle it in `handleNativeMessage` in `web/src/main.ts`, inside the existing `try` / `catch` that ignores malformed input.

No validation adapter is needed in this direction — the app is the trusted producer.

## Direction: Web → Native

This crosses an untrusted boundary. Raw `event.nativeEvent.data` is a string of unknown shape, so **every** inbound message is parsed and validated in `WebViewMessageAdapter.ts` before it reaches application code. Presentation must never read `event.nativeEvent.data` directly.

1. Add the variant to the `WebToNativeMessage` union in both contract files.
2. Send it from `web/src/main.ts` through the existing `postToNative` helper, which falls back to `window.postMessage` when `ReactNativeWebView` is absent so the page still works in a browser.
3. Add a payload validator in `WebViewMessageAdapter.ts` and a `case` in the `switch`, following `validateDepositConfirmed`:

```typescript
case 'MY_MESSAGE': {
  const payloadResult = validateMyMessage(payload);
  if (!payloadResult.ok) {
    return err(payloadResult.error);
  }
  return ok({ type: 'MY_MESSAGE', payload: payloadResult.value });
}
```

Validators return `Result<T, ParseError>` using `ok` / `err`. Reuse the existing `ParseError` kinds — `InvalidJson`, `UnknownMessageType`, `InvalidPayload` — and give `InvalidPayload` a `reason` that names the failed constraint. Check every field explicitly: presence, type, and domain constraints such as non-empty strings and `Number.isFinite(x) && x > 0` for amounts. Never cast unvalidated input.

4. Handle the new `case` in `handleMessage` in `GoalDetailScreen.tsx`. Parse failures are dropped silently at the presentation layer; keep that behaviour.

## Tests

Extend `app/__tests__/infrastructure/WebViewMessageAdapter.test.ts`. The adapter is the boundary guard, so cover the rejections, not just the happy path: missing payload, wrong field types, empty strings, zero, negative and non-finite numbers. Assert the `ParseError` `kind`.

```bash
yarn workspace app test
```

## Verifying the WebView dev server

`app/` loads the Vite micro-app from the URL in
`app/src/infrastructure/config/webViewConfig.ts`. Start the server before opening
the detail screen:

```bash
yarn workspace savings-goal-web dev
adb reverse tcp:5173 tcp:5173
```

The `adb reverse` step is required for Android devices and emulators. The iOS
simulator resolves `localhost` directly; physical iOS devices need the
development machine's LAN address in `WEBVIEW_HOST`.

## Documentation

Update `docs/spec/03-webview-contract.md` with the message shape, its direction, when it is sent, and the validation rules table for inbound payloads. If the message changes user-visible behaviour, also update `docs/spec/06-acceptance-criteria.md` and `docs/spec/08-traceability.md`.
