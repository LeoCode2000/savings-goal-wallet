import { createSavingsGoal, applyDeposit } from '../../src/domain/entities/SavingsGoal';

describe('SavingsGoal', () => {
  const base = () =>
    createSavingsGoal({ id: 'g-1', name: 'Test', targetAmount: 1000000, accumulatedAmount: 0 });

  describe('createSavingsGoal', () => {
    it('initialises progress at 0 when accumulated is 0', () => {
      const goal = base();
      expect(goal.progress.ratio).toBe(0);
      expect(goal.progress.percentage).toBe(0);
      expect(goal.isCompleted).toBe(false);
    });

    it('marks goal as completed when accumulated equals target', () => {
      const goal = createSavingsGoal({
        id: 'g-1', name: 'T', targetAmount: 1000, accumulatedAmount: 1000,
      });
      expect(goal.isCompleted).toBe(true);
      expect(goal.progress.ratio).toBe(1);
    });
  });

  describe('applyDeposit', () => {
    it('increases accumulated amount', () => {
      const goal = base();
      const result = applyDeposit(goal, 300000);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.updatedGoal.accumulatedAmount.amount).toBe(300000);
        expect(result.value.updatedGoal.progress.percentage).toBe(30);
      }
    });

    it('returns error for zero amount', () => {
      const goal = base();
      const result = applyDeposit(goal, 0);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('InvalidDepositAmount');
      }
    });

    it('returns error for negative amount', () => {
      const result = applyDeposit(base(), -1);
      expect(result.ok).toBe(false);
    });

    it('emits GoalCompleted event when goal reaches 100%', () => {
      const goal = createSavingsGoal({
        id: 'g-1', name: 'Vacation', targetAmount: 1000000, accumulatedAmount: 900000,
      });
      const result = applyDeposit(goal, 100000);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.event).not.toBeNull();
        expect(result.value.event?.kind).toBe('GoalCompleted');
        expect(result.value.event?.goalId).toBe('g-1');
      }
    });

    it('does not emit GoalCompleted event for already-completed goal', () => {
      const goal = createSavingsGoal({
        id: 'g-1', name: 'Done', targetAmount: 1000, accumulatedAmount: 1000,
      });
      const result = applyDeposit(goal, 100);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.event).toBeNull();
        expect(result.value.updatedGoal.isCompleted).toBe(true);
      }
    });

    it('caps progress ratio at 1 for over-deposit', () => {
      const goal = base();
      const result = applyDeposit(goal, 9999999);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.updatedGoal.progress.ratio).toBe(1);
      }
    });
  });
});
