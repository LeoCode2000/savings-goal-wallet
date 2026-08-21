// ── Native → Web ──────────────────────────────────────────────────────────────

export interface SessionInitPayload {
  sessionId: string;
  goalId: string;
  goalName: string;
  targetAmount: number;
  accumulatedAmount: number;
  progressPercentage: number;
  isCompleted: boolean;
  userInfo: { displayName: string };
}

export interface GoalUpdatedPayload {
  goalId: string;
  goalName: string;
  targetAmount: number;
  accumulatedAmount: number;
  progressPercentage: number;
  isCompleted: boolean;
}

export type NativeToWebMessage =
  | { type: 'SESSION_INIT'; payload: SessionInitPayload }
  | { type: 'GOAL_UPDATED'; payload: GoalUpdatedPayload };

// ── Web → Native ──────────────────────────────────────────────────────────────

export type WebToNativeMessage =
  | { type: 'DEPOSIT_CONFIRMED'; payload: { goalId: string; amount: number } }
  | { type: 'WEB_READY' };

// ── ReactNativeWebView global ─────────────────────────────────────────────────

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage(data: string): void };
  }
}
