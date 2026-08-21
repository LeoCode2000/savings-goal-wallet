export type DomainError =
  | { kind: 'InvalidDepositAmount'; message: string }
  | { kind: 'InvalidTargetAmount'; message: string }
  | { kind: 'GoalNotFound'; goalId: string }
  | { kind: 'InvalidGoalId'; message: string };

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
