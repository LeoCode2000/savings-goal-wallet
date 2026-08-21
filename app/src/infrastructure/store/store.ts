import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import goalsReducer from './goalsSlice';
import { mmkvStorage } from './mmkvStorage';

export const store = configureStore({
  reducer: {
    goals: persistReducer(
      {
        key: 'goals',
        storage: mmkvStorage,
        whitelist: ['goals', 'selectedGoalId'],
      },
      goalsReducer,
    ),
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
