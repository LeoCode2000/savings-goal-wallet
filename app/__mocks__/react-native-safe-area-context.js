const React = require('react');

const SafeAreaProvider = ({ children }) => children;
const SafeAreaView = ({ children, style }) =>
  React.createElement('View', { style }, children);

const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });
const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 390, height: 844 });

module.exports = {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaInsetsContext: React.createContext(null),
};
