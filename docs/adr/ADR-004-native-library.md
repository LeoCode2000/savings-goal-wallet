# ADR-004 — Native Library

**Date:** 2026-08-20
**Status:** Accepted (implementation deferred to P1)

## Context

The spec requires a native library (`libreria/`) as an independent package with real native code. Three implementation options were evaluated.

## Decision

**Option B —** `showConfirmDialog({ title, message }): Promise<boolean>` via TurboModule.

## Option Comparison


| Criterion       | A: DepositInput               | B: ConfirmDialog | C: notifyGoalCompleted |
| --------------- | ----------------------------- | ---------------- | ---------------------- |
| Complexity      | High                          | Medium           | Low                    |
| Demo value      | Medium                        | **High**         | Medium                 |
| TurboModule fit | Weak (needs Fabric for views) | **Strong**       | Strong                 |
| Testable        | Hard                          | **Easy**         | Easy                   |
| Time risk       | High                          | Medium           | Low                    |




## Why Option B

- Demonstrates real Kotlin code (`AlertDialog.Builder`) — not just wrappers
- Clean JS contract — ideal TurboModule showcase (JSI method call, no bridge overhead)
- Directly satisfies HU4
- The `onGoalCompleted` callback in `MakeDeposit` is already the integration point — swapping `Alert.alert` for the TurboModule call is a single-file change



## Why NOT Option A

Implementing a custom native view (`<DepositInput />`) requires Fabric for RN 0.81+. The setup complexity and time risk outweigh the demo value.

## Why TurboModule over NativeModule Classic

As candidate I'm applying for a Senior role. TurboModule (JSI, codegen) is the current React Native direction since 0.68. The added complexity is a feature of the demo, not a liability.

## Current Fallback (P0)

`Alert.alert()` in `GoalDetailScreen` serves as the placeholder. It is explicitly commented as a P1 replacement target.

## Consequences

- P0 is unblocked — native library is not required for the core flow
- Integration requires only changing the `onGoalCompleted` callback — no domain or application changes
- `libreria/` must be scaffolded with `react-native-builder-bob` and linked via metro `extraNodeModules`

