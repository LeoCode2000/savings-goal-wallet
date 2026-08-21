/** Clamped to [0, 1]; 1.0 means goal is fully met. */
export type Progress = { readonly ratio: number; readonly percentage: number };

export function calculateProgress(accumulated: number, target: number): Progress {
  const ratio = Math.min(accumulated / target, 1);
  return { ratio, percentage: Math.round(ratio * 100) };
}
