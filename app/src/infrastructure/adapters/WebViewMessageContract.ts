// Discriminated union: all messages the Web micro-app can send to React Native
export type WebToNativeMessage =
  | { type: 'DEPOSIT_CONFIRMED'; payload: { goalId: string; amount: number } }
  | { type: 'WEB_READY' };

// Message React Native sends into the WebView on load
export type NativeToWebMessage =
  | {
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
  | {
      type: 'GOAL_UPDATED';
      payload: {
        goalId: string;
        goalName: string;
        targetAmount: number;
        accumulatedAmount: number;
        progressPercentage: number;
        isCompleted: boolean;
      };
    };

export type MessageEnvelope = { type: string; payload?: unknown };

export type ParseError =
  | { kind: 'InvalidJson'; raw: string }
  | { kind: 'UnknownMessageType'; type: string }
  | { kind: 'InvalidPayload'; type: string; reason: string };
