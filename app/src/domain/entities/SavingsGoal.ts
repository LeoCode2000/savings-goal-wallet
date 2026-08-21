import { DomainError, Result, err, ok } from '../errors/DomainErrors';
import { GoalCompletedEvent } from '../events/GoalCompleted';
import { GoalId, createGoalId } from '../valueObjects/GoalId';
import { Money, addMoney, createMoney } from '../valueObjects/Money';
import { Progress, calculateProgress } from '../valueObjects/Progress';

export type SavingsGoal = {
  readonly id: GoalId;
  readonly name: string;
  readonly targetAmount: Money;
  readonly accumulatedAmount: Money;
  readonly progress: Progress;
  readonly isCompleted: boolean;
};

export type DepositResult = {
  updatedGoal: SavingsGoal;
  event: GoalCompletedEvent | null;
};

export function createSavingsGoal(params: {
  id: string;
  name: string;
  targetAmount: number;
  accumulatedAmount: number;
}): SavingsGoal {
  const targetMoney: Money = { amount: params.targetAmount };
  const accumulatedMoney: Money = { amount: params.accumulatedAmount };
  const progress = calculateProgress(params.accumulatedAmount, params.targetAmount);
  return {
    id: createGoalId(params.id),
    name: params.name,
    targetAmount: targetMoney,
    accumulatedAmount: accumulatedMoney,
    progress,
    isCompleted: params.accumulatedAmount >= params.targetAmount,
  };
}

export function applyDeposit(
  goal: SavingsGoal,
  rawAmount: number,
): Result<DepositResult, DomainError> {
  const moneyResult = createMoney(rawAmount);
  if (!moneyResult.ok) {
    return err(moneyResult.error);
  }
  const deposit: Money = moneyResult.value;
  const newAccumulated = addMoney(goal.accumulatedAmount, deposit);
  const newProgress = calculateProgress(newAccumulated.amount, goal.targetAmount.amount);
  const isNowCompleted = newAccumulated.amount >= goal.targetAmount.amount;

  const updatedGoal: SavingsGoal = {
    ...goal,
    accumulatedAmount: newAccumulated,
    progress: newProgress,
    isCompleted: isNowCompleted,
  };

  const event: GoalCompletedEvent | null =
    isNowCompleted && !goal.isCompleted
      ? { kind: 'GoalCompleted', goalId: goal.id, goalName: goal.name, finalAmount: newAccumulated.amount }
      : null;

  return ok({ updatedGoal, event });
}
