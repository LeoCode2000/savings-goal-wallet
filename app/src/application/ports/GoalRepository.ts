import { SavingsGoal } from '../../domain/entities/SavingsGoal';
import { DomainError, Result } from '../../domain/errors/DomainErrors';

export interface GoalRepository {
  getAll(): Promise<SavingsGoal[]>;
  getById(id: string): Promise<SavingsGoal | null>;
  save(goal: SavingsGoal): Promise<void>;
}

export type DepositInput = { goalId: string; amount: number };
export type DepositError = DomainError | { kind: 'RepositoryError'; message: string };
export type DepositOutput = Result<SavingsGoal, DepositError>;
