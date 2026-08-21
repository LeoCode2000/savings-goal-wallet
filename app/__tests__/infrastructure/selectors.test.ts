import { selectAllGoals, selectGoalById, selectDepositStatus } from '../../src/infrastructure/store/selectors';
import { RootState } from '../../src/infrastructure/store/store';

const mockGoal = {
  id: 'g-1', name: 'Test', targetAmount: 1000, accumulatedAmount: 250,
  progressRatio: 0.25, progressPercentage: 25, isCompleted: false,
};

const buildState = (overrides = {}): RootState => ({
  goals: {
    goals: { 'g-1': mockGoal },
    depositStatus: 'idle',
    depositError: null,
    selectedGoalId: null,
    ...overrides,
  },
});

describe('selectors', () => {
  it('selectAllGoals returns all goals as array', () => {
    expect(selectAllGoals(buildState())).toEqual([mockGoal]);
  });

  it('selectGoalById returns correct goal', () => {
    expect(selectGoalById('g-1')(buildState())).toEqual(mockGoal);
  });

  it('selectGoalById returns undefined for missing id', () => {
    expect(selectGoalById('nope')(buildState())).toBeUndefined();
  });

  it('selectDepositStatus reflects current status', () => {
    expect(selectDepositStatus(buildState({ depositStatus: 'loading' }))).toBe('loading');
  });
});
