import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GoalRecord } from '../../infrastructure/store/goalsSlice';

type Props = {
  goal: GoalRecord;
  onPress: (id: string) => void;
};

export function GoalCard({ goal, onPress }: Props) {
  const filled = `${goal.progressPercentage}%`;
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(goal.id)} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.name}>{goal.name}</Text>
        {goal.isCompleted && <Text style={styles.badge}>✓ Completada</Text>}
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: filled }]} />
      </View>
      <View style={styles.amounts}>
        <Text style={styles.accumulated}>
          ${goal.accumulatedAmount.toLocaleString('es-CO')}
        </Text>
        <Text style={styles.target}>
          / ${goal.targetAmount.toLocaleString('es-CO')}
        </Text>
        <Text style={styles.percentage}>{goal.progressPercentage}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', flex: 1 },
  badge: { fontSize: 12, color: '#2ecc71', fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: '#3b82f6', borderRadius: 4, maxWidth: '100%' },
  amounts: { flexDirection: 'row', alignItems: 'center' },
  accumulated: { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  target: { fontSize: 13, color: '#888', marginLeft: 4 },
  percentage: { marginLeft: 'auto', fontSize: 14, fontWeight: '600', color: '#3b82f6' },
});
