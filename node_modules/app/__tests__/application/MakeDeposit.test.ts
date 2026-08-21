import { makeDeposit } from '../../src/application/useCases/MakeDeposit';
import { InMemoryGoalRepository } from '../../src/infrastructure/repositories/InMemoryGoalRepository';
import { GoalCompletedEvent } from '../../src/domain/events/GoalCompleted';

describe('MakeDeposit use case', () => {
  let repository: InMemoryGoalRepository;

  beforeEach(() => {
    repository = new InMemoryGoalRepository([
      { id: 'g-1', name: 'Vacaciones', targetAmount: 1000000, accumulatedAmount: 0 },
      { id: 'g-2', name: 'Done', targetAmount: 500000, accumulatedAmount: 400000 },
    ]);
  });

  it('successfully deposits and returns updated goal', async () => {
    const result = await makeDeposit({ goalId: 'g-1', amount: 250000 }, { repository });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accumulatedAmount.amount).toBe(250000);
      expect(result.value.progress.percentage).toBe(25);
    }
  });

  it('persists the updated goal in the repository', async () => {
    await makeDeposit({ goalId: 'g-1', amount: 300000 }, { repository });
    const saved = await repository.getById('g-1');
    expect(saved?.accumulatedAmount.amount).toBe(300000);
  });

  it('returns GoalNotFound for unknown goalId', async () => {
    const result = await makeDeposit({ goalId: 'g-999', amount: 100 }, { repository });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('GoalNotFound');
    }
  });

  it('returns error for invalid amount', async () => {
    const result = await makeDeposit({ goalId: 'g-1', amount: -100 }, { repository });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('InvalidDepositAmount');
    }
  });

  it('calls onGoalCompleted when goal reaches target', async () => {
    const onGoalCompleted = jest.fn();
    await makeDeposit({ goalId: 'g-2', amount: 100000 }, { repository, onGoalCompleted });
    expect(onGoalCompleted).toHaveBeenCalledTimes(1);
    const event: GoalCompletedEvent = onGoalCompleted.mock.calls[0][0];
    expect(event.kind).toBe('GoalCompleted');
    expect(event.goalId).toBe('g-2');
  });

  it('does not call onGoalCompleted for partial deposit', async () => {
    const onGoalCompleted = jest.fn();
    await makeDeposit({ goalId: 'g-1', amount: 100000 }, { repository, onGoalCompleted });
    expect(onGoalCompleted).not.toHaveBeenCalled();
  });
});
