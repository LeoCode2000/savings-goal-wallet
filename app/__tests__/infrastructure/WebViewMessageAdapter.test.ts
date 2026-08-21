import { parseWebViewMessage } from '../../src/infrastructure/adapters/WebViewMessageAdapter';

describe('WebViewMessageAdapter', () => {
  describe('valid DEPOSIT_CONFIRMED', () => {
    it('parses a well-formed deposit message', () => {
      const raw = JSON.stringify({ type: 'DEPOSIT_CONFIRMED', payload: { goalId: 'g-1', amount: 50000 } });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe('DEPOSIT_CONFIRMED');
        if (result.value.type === 'DEPOSIT_CONFIRMED') {
          expect(result.value.payload.goalId).toBe('g-1');
          expect(result.value.payload.amount).toBe(50000);
        }
      }
    });
  });

  describe('valid WEB_READY', () => {
    it('parses WEB_READY message without payload', () => {
      const raw = JSON.stringify({ type: 'WEB_READY' });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe('WEB_READY');
      }
    });
  });

  describe('invalid JSON', () => {
    it('returns InvalidJson for malformed string', () => {
      const result = parseWebViewMessage('not-json{{');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('InvalidJson');
      }
    });
  });

  describe('unknown type', () => {
    it('returns UnknownMessageType for unrecognised type', () => {
      const raw = JSON.stringify({ type: 'UNKNOWN_EVENT' });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('UnknownMessageType');
      }
    });
  });

  describe('invalid DEPOSIT_CONFIRMED payload', () => {
    it('rejects missing goalId', () => {
      const raw = JSON.stringify({ type: 'DEPOSIT_CONFIRMED', payload: { amount: 1000 } });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(false);
      if (!result.ok) { expect(result.error.kind).toBe('InvalidPayload'); }
    });

    it('rejects empty goalId', () => {
      const raw = JSON.stringify({ type: 'DEPOSIT_CONFIRMED', payload: { goalId: '', amount: 1000 } });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(false);
    });

    it('rejects zero amount', () => {
      const raw = JSON.stringify({ type: 'DEPOSIT_CONFIRMED', payload: { goalId: 'g-1', amount: 0 } });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(false);
    });

    it('rejects negative amount', () => {
      const raw = JSON.stringify({ type: 'DEPOSIT_CONFIRMED', payload: { goalId: 'g-1', amount: -500 } });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(false);
    });

    it('rejects non-finite amount (Infinity)', () => {
      const raw = JSON.stringify({ type: 'DEPOSIT_CONFIRMED', payload: { goalId: 'g-1', amount: Infinity } });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(false);
    });

    it('rejects missing payload entirely', () => {
      const raw = JSON.stringify({ type: 'DEPOSIT_CONFIRMED' });
      const result = parseWebViewMessage(raw);
      expect(result.ok).toBe(false);
    });
  });
});
