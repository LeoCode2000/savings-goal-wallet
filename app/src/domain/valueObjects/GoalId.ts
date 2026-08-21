export type GoalId = string & { readonly _brand: 'GoalId' };

export function createGoalId(raw: string): GoalId {
  if (!raw || raw.trim().length === 0) {
    throw new Error('GoalId cannot be empty');
  }
  return raw as GoalId;
}
