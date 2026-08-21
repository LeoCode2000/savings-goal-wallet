import { createMMKV } from 'react-native-mmkv';
import type { Storage } from 'redux-persist';

const mmkv = createMMKV({ id: 'savings-goal-wallet' });

export const mmkvStorage: Storage = {
  getItem: key => Promise.resolve(mmkv.getString(key) ?? null),
  setItem: (key, value) => {
    mmkv.set(key, value);
    return Promise.resolve();
  },
  removeItem: key => {
    mmkv.remove(key);
    return Promise.resolve();
  },
};