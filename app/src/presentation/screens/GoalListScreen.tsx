import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoalCard } from '../components/GoalCard';
import { GoalRecord } from '../../infrastructure/store/goalsSlice';
import { useGoals } from '../hooks/useGoals';

type Props = {
  onGoalPress: (goal: GoalRecord) => void;
};

export function GoalListScreen({ onGoalPress }: Props) {
  const { goals, loadGoals } = useGoals();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    loadGoals()
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [loadGoals]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando metas...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis metas de ahorro</Text>
      </View>
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GoalCard goal={item} onPress={() => onGoalPress(item)} />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7ff' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#3b82f6' },
  errorText: { fontSize: 14, color: '#e74c3c', paddingHorizontal: 24, textAlign: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  list: { paddingBottom: 24 },
});
