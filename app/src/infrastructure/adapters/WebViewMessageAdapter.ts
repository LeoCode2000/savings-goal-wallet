import { Result, err, ok } from '../../domain/errors/DomainErrors';
import {
  MessageEnvelope,
  ParseError,
  WebToNativeMessage,
} from './WebViewMessageContract';

function parseEnvelope(raw: string): Result<MessageEnvelope, ParseError> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return err({ kind: 'InvalidJson', raw });
  }
  if (typeof parsed !== 'object' || parsed === null || !('type' in parsed)) {
    return err({ kind: 'InvalidJson', raw });
  }
  return ok(parsed as MessageEnvelope);
}

function validateDepositConfirmed(
  payload: unknown,
): Result<{ goalId: string; amount: number }, ParseError> {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof (payload as Record<string, unknown>).goalId !== 'string' ||
    !(payload as Record<string, unknown>).goalId ||
    typeof (payload as Record<string, unknown>).amount !== 'number' ||
    !Number.isFinite((payload as Record<string, unknown>).amount as number) ||
    ((payload as Record<string, unknown>).amount as number) <= 0
  ) {
    return err({
      kind: 'InvalidPayload',
      type: 'DEPOSIT_CONFIRMED',
      reason: 'goalId must be a non-empty string and amount must be a positive finite number',
    });
  }
  const p = payload as { goalId: string; amount: number };
  return ok({ goalId: p.goalId, amount: p.amount });
}

export function parseWebViewMessage(
  raw: string,
): Result<WebToNativeMessage, ParseError> {
  const envelopeResult = parseEnvelope(raw);
  if (!envelopeResult.ok) {
    return err(envelopeResult.error);
  }

  const { type, payload } = envelopeResult.value;

  switch (type) {
    case 'DEPOSIT_CONFIRMED': {
      const payloadResult = validateDepositConfirmed(payload);
      if (!payloadResult.ok) {
        return err(payloadResult.error);
      }
      return ok({ type: 'DEPOSIT_CONFIRMED', payload: payloadResult.value });
    }
    case 'WEB_READY':
      return ok({ type: 'WEB_READY' });
    default:
      return err({ kind: 'UnknownMessageType', type });
  }
}
