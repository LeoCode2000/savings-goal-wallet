import { SavingsGoal, createSavingsGoal } from '../../domain/entities/SavingsGoal';
import { GoalRepository } from '../../application/ports/GoalRepository';

const SEED_DATA = [
  { id: 'g-1', name: 'Vacaciones Cartagena', targetAmount: 2000000, accumulatedAmount: 850000 },
  { id: 'g-2', name: 'Fondo de emergencia', targetAmount: 5000000, accumulatedAmount: 1200000 },
  { id: 'g-3', name: 'Laptop nueva', targetAmount: 3500000, accumulatedAmount: 3500000 },
];

export class InMemoryGoalRepository implements GoalRepository {
  private store: Map<string, SavingsGoal>;

  constructor(seed = SEED_DATA) {
    this.store = new Map(
      seed.map(d => [d.id, createSavingsGoal(d)]),
    );
  }

  async getAll(): Promise<SavingsGoal[]> {
    return Array.from(this.store.values());
  }

  async getById(id: string): Promise<SavingsGoal | null> {
    return this.store.get(id) ?? null;
  }

  async save(goal: SavingsGoal): Promise<void> {
    this.store.set(goal.id, goal);
  }
}
