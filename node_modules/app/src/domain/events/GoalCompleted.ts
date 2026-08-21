export type GoalCompletedEvent = {
  readonly kind: 'GoalCompleted';
  readonly goalId: string;
  readonly goalName: string;
  readonly finalAmount: number;
};
