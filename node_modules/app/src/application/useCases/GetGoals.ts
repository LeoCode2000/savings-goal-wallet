import { SavingsGoal } from '../../domain/entities/SavingsGoal';
import { GoalRepository } from '../ports/GoalRepository';

export async function getGoals(repository: GoalRepository): Promise<SavingsGoal[]> {
  return repository.getAll();
}
