# 03 — WebView Contract

## Overview

Communication is **bidirectional** and **exclusively via `postMessage`**. All messages are JSON strings. The Application layer never sees raw `event.nativeEvent.data` — the Adapter handles parsing and validation.

---

## Native → Web

Sent by React Native into the WebView via `webViewRef.current?.postMessage(json)`.

### SESSION_INIT
Sent when the web signals `WEB_READY`. Carries all data the web needs to render.

```typescript
{
  type: 'SESSION_INIT';
  payload: {
    sessionId: string;
    goalId: string;
    goalName: string;
    targetAmount: number;
    accumulatedAmount: number;
    progressPercentage: number;
    isCompleted: boolean;
    userInfo: { displayName: string };
  };
}
```

### GOAL_UPDATED
Sent after a successful deposit to refresh the web UI without re-mounting.

```typescript
{
  type: 'GOAL_UPDATED';
  payload: {
    goalId: string;
    goalName: string;
    targetAmount: number;
    accumulatedAmount: number;
    progressPercentage: number;
    isCompleted: boolean;
  };
}
```

---

## Web → Native

Sent by the micro-app via `window.ReactNativeWebView.postMessage(json)`.

```typescript
type WebToNativeMessage =
  | { type: 'DEPOSIT_CONFIRMED'; payload: { goalId: string; amount: number } }
  | { type: 'WEB_READY' };
```

---

## Adapter Flow

```
event.nativeEvent.data  (raw string)
        │
        ▼
  JSON.parse()
        │ failure → ParseError { kind: 'InvalidJson' }
        ▼
  validate envelope shape (has .type)
        │ failure → ParseError { kind: 'InvalidJson' }
        ▼
  switch(type)
        │ unknown → ParseError { kind: 'UnknownMessageType' }
        ▼
  validate payload per type
        │ failure → ParseError { kind: 'InvalidPayload' }
        ▼
  WebToNativeMessage  (typed, safe)
        │
        ▼
  Application layer (HandleWebMessage)
```

---

## Validation Rules for DEPOSIT_CONFIRMED

| Field | Rule |
|-------|------|
| `payload` | must be a non-null object |
| `payload.goalId` | must be a non-empty string |
| `payload.amount` | must be a positive finite number (`> 0` and `Number.isFinite`) |

---

## Error Types

```typescript
type ParseError =
  | { kind: 'InvalidJson';        raw: string }
  | { kind: 'UnknownMessageType'; type: string }
  | { kind: 'InvalidPayload';     type: string; reason: string };
```

All parse errors are dropped silently at the presentation layer. In a production app they would be forwarded to an observability service.
