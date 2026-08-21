# 06 — Acceptance Criteria

## HU1 — Goal List

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-1.1 | List displays all goals | `GoalListScreen` renders a `GoalCard` per goal |
| AC-1.2 | Each card shows name, target amount, accumulated amount, progress % | `GoalCard` props map all four fields |
| AC-1.3 | Progress bar width reflects percentage | `width: progressPercentage + '%'` |
| AC-1.4 | Completed goals show a badge | `isCompleted` → badge visible |
| AC-1.5 | Tapping a card navigates to goal detail | `onGoalPress` callback fires with `GoalRecord` |

## HU2 — Goal Detail and Deposit Form

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-2.1 | Detail screen renders the Vite micro-app in a `WebView` | `GoalDetailScreen` mounts `WebView` with `source={{ uri: GOAL_DETAIL_URL }}` |
| AC-2.2 | Web app displays goal name, amounts and progress | `SESSION_INIT` payload contains all fields; web renders them |
| AC-2.3 | Deposit input accepts positive numbers only | Web validates `amount > 0` before sending |
| AC-2.4 | Confirming deposit sends `DEPOSIT_CONFIRMED` via postMessage | `window.ReactNativeWebView.postMessage(...)` called |
| AC-2.5 | Completed goals disable the deposit button | `depositBtn.disabled = true` when `isCompleted` |

## HU3 — State Update

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-3.1 | `DEPOSIT_CONFIRMED` message is parsed and validated | `WebViewMessageAdapter` returns typed message |
| AC-3.2 | Valid deposit updates Redux state | `depositConfirmed` action carries updated `GoalRecord` |
| AC-3.3 | `GoalListScreen` reflects new accumulated amount without app reload | `useSelector(selectAllGoals)` re-renders on state change |
| AC-3.4 | Invalid messages (bad JSON, unknown type, bad payload) are dropped silently | Adapter returns `err(ParseError)` — no crash |

## HU4 — Goal Completed

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-4.1 | Native confirmation shown when `progress >= 100%` | `onGoalCompleted` callback invoked by `MakeDeposit` → `showGoalCompletedDialog` |
| AC-4.2 | `GoalCompleted` event fires only on the completing deposit, not on subsequent deposits | `!goal.isCompleted` guard in `applyDeposit` |
| AC-4.3 | Dialog uses native Android `AlertDialog` / iOS `UIAlertController` | `showConfirmDialog` TurboModule from `react-native-native-implementations`, called via `NativeDialogAdapter` |
| AC-4.4 | A successful deposit that does not complete the goal shows a native success dialog instead | `NativeDialogAdapter.test` covers the dialog copy and callbacks; the one-dialog-per-deposit choice lives in `GoalDetailScreen` |
