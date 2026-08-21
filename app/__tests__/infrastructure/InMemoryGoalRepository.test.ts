import { createSavingsGoal } from '../../src/domain/entities/SavingsGoal';
import { InMemoryGoalRepository } from '../../src/infrastructure/repositories/InMemoryGoalRepository';

describe('InMemoryGoalRepository', () => {
  it('replaces seed data with persisted goals', async () => {
    const repository = new InMemoryGoalRepository();
    const persistedGoal = createSavingsGoal({
      id: 'g-1',
      name: 'Vacaciones Cartagena',
      targetAmount: 2000000,
      accumulatedAmount: 1250000,
    });

    repository.replaceAll([persistedGoal]);

    expect(await repository.getAll()).toEqual([persistedGoal]);
  });
});