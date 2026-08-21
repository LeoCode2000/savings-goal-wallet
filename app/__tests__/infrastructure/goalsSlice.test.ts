import goalsReducer, {
  GoalsState,
  goalsLoaded,
  depositStarted,
  depositConfirmed,
  depositFailed,
  depositReset,
  goalSelected,
} from '../../src/infrastructure/store/goalsSlice';

const mockGoal = {
  id: 'g-1',
  name: 'Vacaciones',
  targetAmount: 2000000,
  accumulatedAmount: 500000,
  progressRatio: 0.25,
  progressPercentage: 25,
  isCompleted: false,
};

const initialState: GoalsState = {
  goals: {},
  depositStatus: 'idle',
  depositError: null,
  selectedGoalId: null,
};

describe('goalsSlice', () => {
  it('returns initial state', () => {
    expect(goalsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('goalsLoaded populates goals by id', () => {
    const state = goalsReducer(initialState, goalsLoaded([mockGoal]));
    expect(state.goals['g-1']).toEqual(mockGoal);
  });

  it('depositStarted sets loading status', () => {
    const state = goalsReducer(initialState, depositStarted());
    expect(state.depositStatus).toBe('loading');
    expect(state.depositError).toBeNull();
  });

  it('depositConfirmed updates goal and sets success', () => {
    const loaded = goalsReducer(initialState, goalsLoaded([mockGoal]));
    const updated = { ...mockGoal, accumulatedAmount: 1000000, progressPercentage: 50 };
    const state = goalsReducer(loaded, depositConfirmed(updated));
    expect(state.goals['g-1'].accumulatedAmount).toBe(1000000);
    expect(state.depositStatus).toBe('success');
  });

  it('depositFailed sets error state', () => {
    const state = goalsReducer(initialState, depositFailed('Goal not found'));
    expect(state.depositStatus).toBe('error');
    expect(state.depositError).toBe('Goal not found');
  });

  it('depositReset clears status', () => {
    const errState = goalsReducer(initialState, depositFailed('err'));
    const state = goalsReducer(errState, depositReset());
    expect(state.depositStatus).toBe('idle');
    expect(state.depositError).toBeNull();
  });

  it('goalSelected sets selectedGoalId', () => {
    const state = goalsReducer(initialState, goalSelected('g-2'));
    expect(state.selectedGoalId).toBe('g-2');
  });
});
