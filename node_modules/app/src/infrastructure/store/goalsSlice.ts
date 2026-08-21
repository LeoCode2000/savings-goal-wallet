import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SavingsGoal } from '../../domain/entities/SavingsGoal';

// Plain serializable shape for Redux — mirrors SavingsGoal but without branded types
export type GoalRecord = {
  id: string;
  name: string;
  targetAmount: number;
  accumulatedAmount: number;
  progressRatio: number;
  progressPercentage: number;
  isCompleted: boolean;
};

export type GoalsState = {
  goals: Record<string, GoalRecord>;
  depositStatus: 'idle' | 'loading' | 'success' | 'error';
  depositError: string | null;
  selectedGoalId: string | null;
};

const initialState: GoalsState = {
  goals: {},
  depositStatus: 'idle',
  depositError: null,
  selectedGoalId: null,
};

export function toGoalRecord(goal: SavingsGoal): GoalRecord {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.amount,
    accumulatedAmount: goal.accumulatedAmount.amount,
    progressRatio: goal.progress.ratio,
    progressPercentage: goal.progress.percentage,
    isCompleted: goal.isCompleted,
  };
}

export const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    goalsLoaded(state, action: PayloadAction<GoalRecord[]>) {
      state.goals = {};
      for (const goal of action.payload) {
        state.goals[goal.id] = goal;
      }
    },
    depositStarted(state) {
      state.depositStatus = 'loading';
      state.depositError = null;
    },
    depositConfirmed(state, action: PayloadAction<GoalRecord>) {
      state.goals[action.payload.id] = action.payload;
      state.depositStatus = 'success';
    },
    depositFailed(state, action: PayloadAction<string>) {
      state.depositStatus = 'error';
      state.depositError = action.payload;
    },
    depositReset(state) {
      state.depositStatus = 'idle';
      state.depositError = null;
    },
    goalSelected(state, action: PayloadAction<string>) {
      state.selectedGoalId = action.payload;
    },
  },
});

export const {
  goalsLoaded,
  depositStarted,
  depositConfirmed,
  depositFailed,
  depositReset,
  goalSelected,
} = goalsSlice.actions;

export default goalsSlice.reducer;
