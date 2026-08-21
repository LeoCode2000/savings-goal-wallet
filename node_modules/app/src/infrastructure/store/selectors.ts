import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { GoalRecord } from './goalsSlice';

const selectGoalsMap = (state: RootState) => state.goals.goals;

export const selectAllGoals = createSelector(
  selectGoalsMap,
  (goals): GoalRecord[] => Object.values(goals),
);

export const selectGoalById =
  (id: string) =>
  (state: RootState): GoalRecord | undefined =>
    state.goals.goals[id];

export const selectDepositStatus = (state: RootState) => state.goals.depositStatus;

export const selectDepositError = (state: RootState) => state.goals.depositError;

export const selectSelectedGoalId = (state: RootState) => state.goals.selectedGoalId;
