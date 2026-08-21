import { DomainError, Result, err, ok } from '../errors/DomainErrors';

export type Money = { readonly amount: number };

export function createMoney(amount: number): Result<Money, DomainError> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return err({ kind: 'InvalidDepositAmount', message: `Amount must be a positive finite number, got ${amount}` });
  }
  return ok({ amount });
}

export function addMoney(a: Money, b: Money): Money {
  return { amount: a.amount + b.amount };
}
