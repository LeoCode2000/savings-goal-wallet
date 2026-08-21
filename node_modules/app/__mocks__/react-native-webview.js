const React = require('react');

const WebView = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({ postMessage: jest.fn() }));
  return React.createElement('WebView', props);
});
WebView.displayName = 'WebView';

module.exports = { default: WebView, WebView };
