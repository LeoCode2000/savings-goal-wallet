import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeDeposit } from '../../application/useCases/MakeDeposit';
import { getGoals } from '../../application/useCases/GetGoals';
import { GoalCompletedEvent } from '../../domain/events/GoalCompleted';
import { AppDispatch } from '../../infrastructure/store/store';
import {
  depositConfirmed,
  depositFailed,
  depositReset,
  depositStarted,
  goalsLoaded,
  goalSelected,
  toGoalRecord,
} from '../../infrastructure/store/goalsSlice';
import {
  selectAllGoals,
  selectDepositStatus,
  selectSelectedGoalId,
} from '../../infrastructure/store/selectors';
import { InMemoryGoalRepository } from '../../infrastructure/repositories/InMemoryGoalRepository';

// Singleton repository — in real app would be injected via context/DI
const repository = new InMemoryGoalRepository();

export function useGoals() {
  const dispatch = useDispatch<AppDispatch>();
  const goals = useSelector(selectAllGoals);
  const depositStatus = useSelector(selectDepositStatus);
  const selectedGoalId = useSelector(selectSelectedGoalId);

  const loadGoals = useCallback(async () => {
    const result = await getGoals(repository);
    dispatch(goalsLoaded(result.map(toGoalRecord)));
  }, [dispatch]);

  const deposit = useCallback(
    async (
      goalId: string,
      amount: number,
      onGoalCompleted?: (event: GoalCompletedEvent) => void,
    ) => {
      dispatch(depositStarted());
      const result = await makeDeposit(
        { goalId, amount },
        { repository, onGoalCompleted },
      );
      if (result.ok) {
        dispatch(depositConfirmed(toGoalRecord(result.value)));
      } else {
        const error = result.error;
        const message =
          'message' in error
            ? error.message
            : 'goalId' in error
              ? `Goal not found: ${error.goalId}`
              : 'Unknown error';
        dispatch(depositFailed(message));
      }
    },
    [dispatch],
  );

  const resetDeposit = useCallback(() => dispatch(depositReset()), [dispatch]);
  const selectGoal = useCallback((id: string) => dispatch(goalSelected(id)), [dispatch]);

  return { goals, depositStatus, selectedGoalId, loadGoals, deposit, resetDeposit, selectGoal };
}
