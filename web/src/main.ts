import type { GoalUpdatedPayload, NativeToWebMessage, WebToNativeMessage } from './types';

// ── State ─────────────────────────────────────────────────────────────────────

let currentGoalId: string | null = null;
let readyAttempts = 0;
let readyInterval: number | null = null;

const MAX_READY_ATTEMPTS = 30;
const READY_RETRY_MS = 100;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCOP(value: number): string {
  return '$' + value.toLocaleString('es-CO');
}

function postToNative(msg: WebToNativeMessage): void {
  const data = JSON.stringify(msg);
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(data);
  } else {
    window.postMessage(data, '*');
  }
}

// ── UI ────────────────────────────────────────────────────────────────────────

function updateUI(data: GoalUpdatedPayload): void {
  (document.getElementById('goalName') as HTMLElement).textContent =
    data.goalName || data.goalId || '';
  (document.getElementById('progressFill') as HTMLElement).style.width =
    (data.progressPercentage ?? 0) + '%';
  (document.getElementById('accumulated') as HTMLElement).textContent =
    formatCOP(data.accumulatedAmount ?? 0);
  (document.getElementById('target') as HTMLElement).textContent =
    '/ ' + formatCOP(data.targetAmount ?? 0);
  (document.getElementById('percentage') as HTMLElement).textContent =
    (data.progressPercentage ?? 0) + '%';

  const badge = document.getElementById('completedBadge') as HTMLElement;
  badge.style.display = data.isCompleted ? 'inline-block' : 'none';
  (document.getElementById('depositBtn') as HTMLButtonElement).disabled =
    data.isCompleted;
}

// ── Message handler ───────────────────────────────────────────────────────────

function handleNativeMessage(event: MessageEvent): void {
  try {
    if (typeof event.data !== 'string') {
      return;
    }

    const msg = JSON.parse(event.data) as NativeToWebMessage;
    if (msg.type === 'SESSION_INIT') {
      const p = msg.payload;
      currentGoalId = p.goalId;
      updateUI(p);
      if (readyInterval !== null) {
        window.clearInterval(readyInterval);
        readyInterval = null;
      }
    } else if (msg.type === 'GOAL_UPDATED') {
      updateUI(msg.payload);
    }
  } catch {
    // ignore malformed messages
  }
}

document.addEventListener('message', handleNativeMessage as EventListener);
window.addEventListener('message', handleNativeMessage);

// ── Deposit form ──────────────────────────────────────────────────────────────

const depositInput = document.getElementById('depositAmount') as HTMLInputElement;
const depositBtn = document.getElementById('depositBtn') as HTMLButtonElement;
const errorEl = document.getElementById('inputError') as HTMLElement;
const successEl = document.getElementById('successMsg') as HTMLElement;

depositInput.addEventListener('input', () => {
  errorEl.textContent = '';
  successEl.textContent = '';
});

depositBtn.addEventListener('click', () => {
  errorEl.textContent = '';
  successEl.textContent = '';

  const raw = depositInput.value.trim();
  const amount = parseFloat(raw);

  if (!raw || isNaN(amount) || amount <= 0) {
    errorEl.textContent = 'Ingresa un monto válido mayor a 0.';
    return;
  }
  if (!currentGoalId) {
    errorEl.textContent = 'No se ha cargado la meta. Intenta de nuevo.';
    return;
  }

  postToNative({ type: 'DEPOSIT_CONFIRMED', payload: { goalId: currentGoalId, amount } });

  depositInput.value = '';
  successEl.textContent = '¡Abono enviado! Procesando...';
  depositBtn.disabled = true;
  setTimeout(() => { depositBtn.disabled = false; }, 1500);
});

// ── Signal readiness ──────────────────────────────────────────────────────────

function signalReady(): void {
  if (window.ReactNativeWebView) {
    postToNative({ type: 'WEB_READY' });
    readyAttempts += 1;

    if (readyAttempts >= MAX_READY_ATTEMPTS && readyInterval !== null) {
      window.clearInterval(readyInterval);
      readyInterval = null;
    }
  }
}

signalReady();
readyInterval = window.setInterval(signalReady, READY_RETRY_MS);
