import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, useColorScheme } from 'react-native';
import { store } from './src/infrastructure/store/store';
import { GoalListScreen } from './src/presentation/screens/GoalListScreen';
import { GoalDetailScreen } from './src/presentation/screens/GoalDetailScreen';
import { GoalRecord } from './src/infrastructure/store/goalsSlice';

type Screen = { name: 'list' } | { name: 'detail'; goal: GoalRecord };

function AppNavigator() {
  const [screen, setScreen] = useState<Screen>({ name: 'list' });

  if (screen.name === 'detail') {
    return (
      <GoalDetailScreen
        goal={screen.goal}
        onBack={() => setScreen({ name: 'list' })}
      />
    );
  }

  return (
    <GoalListScreen
      onGoalPress={goal => setScreen({ name: 'detail', goal })}
    />
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
