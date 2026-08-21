import { applyDeposit } from '../../domain/entities/SavingsGoal';
import { GoalCompletedEvent } from '../../domain/events/GoalCompleted';
import { err, ok } from '../../domain/errors/DomainErrors';
import { DepositInput, DepositOutput, GoalRepository } from '../ports/GoalRepository';

type MakeDepositDeps = {
  repository: GoalRepository;
  onGoalCompleted?: (event: GoalCompletedEvent) => void;
};

export async function makeDeposit(
  input: DepositInput,
  deps: MakeDepositDeps,
): Promise<DepositOutput> {
  const goal = await deps.repository.getById(input.goalId);
  if (!goal) {
    return err({ kind: 'GoalNotFound', goalId: input.goalId });
  }

  const result = applyDeposit(goal, input.amount);
  if (!result.ok) {
    return err(result.error);
  }

  const { updatedGoal, event } = result.value;
  await deps.repository.save(updatedGoal);

  if (event && deps.onGoalCompleted) {
    deps.onGoalCompleted(event);
  }

  return ok(updatedGoal);
}
