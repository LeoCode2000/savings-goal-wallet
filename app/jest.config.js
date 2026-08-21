module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-webview|react-native-safe-area-context|@reduxjs/toolkit|immer|react-redux)/)',
  ],
  moduleNameMapper: {
    'react-native-mmkv': '<rootDir>/__mocks__/react-native-mmkv.js',
    'react-native-webview': '<rootDir>/__mocks__/react-native-webview.js',
    'react-native-safe-area-context': '<rootDir>/__mocks__/react-native-safe-area-context.js',
  },
};
