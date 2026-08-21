# 08 — Traceability Matrix

| Requirement | User Story | Use Case | Domain Rule | Acceptance Criterion | Test | Implementation |
|-------------|-----------|----------|-------------|---------------------|------|----------------|
| NFR-01 RN 0.81+ | — | — | — | — | — | `app/package.json` |
| NFR-02 TypeScript strict | — | — | — | — | — | `tsconfig.json` |
| Show goal list | HU1 | UC-01 GetGoals | — | AC-1.1–1.5 | `goalsSlice.test` · `selectors.test` | `GoalListScreen` · `GoalCard` · `useGoals` |
| Show goal name | HU1 | UC-01 | — | AC-1.2 | `goalsSlice.test` (goalsLoaded) | `GoalCard.name` |
| Show target amount | HU1 | UC-01 | `targetAmount > 0` | AC-1.2 | `SavingsGoal.test` | `Money` · `GoalCard` |
| Show accumulated amount | HU1 | UC-01 | — | AC-1.2 | `SavingsGoal.test` · `MakeDeposit.test` | `GoalCard.accumulatedAmount` |
| Show progress % | HU1 | UC-01 | `progress = acc/target` | AC-1.2 · AC-1.3 | `SavingsGoal.test` | `Progress` · `GoalCard` |
| Open goal detail in WebView | HU2 | — | — | AC-2.1 | Manual device verification | `GoalDetailScreen` · `webViewConfig` · Vite dev server |
| Display goal in web | HU2 | UC-03 HandleWebMessage | — | AC-2.2 | `WebViewMessageAdapter.test` | `SESSION_INIT` payload · `web/index.html` |
| Deposit form | HU2 | — | — | AC-2.3–2.4 | — | `web/index.html` form |
| postMessage DEPOSIT_CONFIRMED | HU2 | UC-03 | — | AC-2.4 | `WebViewMessageAdapter.test` | `WebViewMessageAdapter` |
| Parse & validate postMessage | HU3 | UC-03 | — | AC-3.1 · AC-3.4 | `WebViewMessageAdapter.test` (9 cases) | `WebViewMessageAdapter` |
| Update Redux on deposit | HU3 | UC-02 MakeDeposit | `applyDeposit` | AC-3.2 | `goalsSlice.test` · `MakeDeposit.test` | `goalsSlice.depositConfirmed` · `useGoals` |
| List reflects new state | HU3 | — | — | AC-3.3 | `selectors.test` | `selectAllGoals` (memoised) |
| Native confirmation | HU4 | UC-04 | `GoalCompleted event` | AC-4.1–4.3 | `MakeDeposit.test` (callback tests) · `NativeDialogAdapter.test` | `showGoalCompletedDialog` via `NativeDialogAdapter` → `showConfirmDialog` TurboModule |
| Native deposit success dialog | HU4 | UC-02 | — | AC-4.4 | `NativeDialogAdapter.test` (copy + callbacks) | `showDepositSuccessDialog` in `GoalDetailScreen` |
| GoalCompleted once only | HU4 | UC-02 | `!goal.isCompleted guard` | AC-4.2 | `SavingsGoal.test` (no double-emit) | `applyDeposit` event guard |
| Invalid deposit amount | — | UC-02 | `amount <= 0` | AC-3.4 | `SavingsGoal.test` · `MakeDeposit.test` | `createMoney` · `applyDeposit` |
| Goal not found | — | UC-02 | — | — | `MakeDeposit.test` | `GoalNotFound` error |
