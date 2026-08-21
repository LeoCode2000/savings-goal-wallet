import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { GoalRecord } from '../../infrastructure/store/goalsSlice';
import { NativeToWebMessage } from '../../infrastructure/adapters/WebViewMessageContract';
import { parseWebViewMessage } from '../../infrastructure/adapters/WebViewMessageAdapter';
import {
  showDepositSuccessDialog,
  showGoalCompletedDialog,
} from '../../infrastructure/adapters/NativeDialogAdapter';
import { GOAL_DETAIL_URL } from '../../infrastructure/config/webViewConfig';
import { useGoals } from '../hooks/useGoals';
import { GoalCompletedEvent } from '../../domain/events/GoalCompleted';

type Props = {
  goal: GoalRecord;
  onBack: () => void;
};

export function GoalDetailScreen({ goal, onBack }: Props) {
  // react-native-webview@14 types the class as `WebView<P = undefined>` with props
  // `WebViewProps & P`, which collapses to `never`. Instantiating P keeps props usable.
  const webViewRef = useRef<WebView<object>>(null);
  const { deposit } = useGoals();

  const sendGoalUpdated = useCallback((updatedGoal: GoalRecord) => {
    const message: NativeToWebMessage = {
      type: 'GOAL_UPDATED',
      payload: {
        goalId: updatedGoal.id,
        goalName: updatedGoal.name,
        targetAmount: updatedGoal.targetAmount,
        accumulatedAmount: updatedGoal.accumulatedAmount,
        progressPercentage: updatedGoal.progressPercentage,
        isCompleted: updatedGoal.isCompleted,
      },
    };
    webViewRef.current?.postMessage(JSON.stringify(message));
  }, []);

  // HU3: send session context to Web immediately after it signals ready
  const sendSessionInit = useCallback(() => {
    const message: NativeToWebMessage = {
      type: 'SESSION_INIT',
      payload: {
        sessionId: `session-${Date.now()}`,
        goalId: goal.id,
        goalName: goal.name,
        targetAmount: goal.targetAmount,
        accumulatedAmount: goal.accumulatedAmount,
        progressPercentage: goal.progressPercentage,
        isCompleted: goal.isCompleted,
        userInfo: { displayName: 'Usuario' },
      },
    };
    webViewRef.current?.postMessage(JSON.stringify(message));
  }, [goal]);

  // HU3: handle incoming postMessage from Web
  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const raw = event.nativeEvent.data;
      const result = parseWebViewMessage(raw);

      if (!result.ok) {
        // Silent fail for unknown/malformed messages; real app would log to observability
        return;
      }

      const msg = result.value;

      switch (msg.type) {
        case 'WEB_READY':
          sendSessionInit();
          break;

        case 'DEPOSIT_CONFIRMED': {
          const completion: { event: GoalCompletedEvent | null } = { event: null };
          const updatedGoal = await deposit(
            msg.payload.goalId,
            msg.payload.amount,
            (completedEvent: GoalCompletedEvent) => {
              completion.event = completedEvent;
            },
          );
          if (!updatedGoal) {
            break;
          }

          // Refresh the Web UI first so progress is current behind the dialog
          sendGoalUpdated(updatedGoal);

          // HU4: native dialog from the TurboModule library
          const completedEvent = completion.event;
          if (completedEvent) {
            showGoalCompletedDialog({
              goalName: completedEvent.goalName,
              finalAmount: completedEvent.finalAmount,
              onSeeGoals: onBack,
            });
          } else {
            showDepositSuccessDialog({
              goalName: updatedGoal.name,
              amount: msg.payload.amount,
              accumulatedAmount: updatedGoal.accumulatedAmount,
              onGoBack: onBack,
            });
          }
          break;
        }
      }
    },
    [deposit, onBack, sendGoalUpdated, sendSessionInit],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{goal.name}</Text>
      </View>
      <WebView<object>
        ref={webViewRef}
        source={{ uri: GOAL_DETAIL_URL }}
        onMessage={handleMessage}
        renderError={() => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              No se pudo cargar el detalle. Verifica que el servidor de Vite esté
              corriendo.
            </Text>
          </View>
        )}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  backButton: { marginRight: 12 },
  backText: { fontSize: 16, color: '#3b82f6' },
  title: { fontSize: 18, fontWeight: '600', color: '#1a1a2e', flex: 1 },
  webView: { flex: 1 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5f7ff',
  },
  errorText: {
    color: '#1a1a2e',
    fontSize: 16,
    textAlign: 'center',
  },
});
