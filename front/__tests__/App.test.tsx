/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/navigation/RootNavigator', () => {
  const R = require('react');
  const { Text } = require('react-native');
  return {
    RootNavigator: () => R.createElement(Text, null, 'Tsyganestan'),
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
