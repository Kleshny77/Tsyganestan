/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, style, ...props }) =>
    React.createElement(View, { style, ...props }, children);
});

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(async () => ({ assets: [] })),
}));

jest.mock('react-native-sensors', () => ({
  accelerometer: { subscribe: () => ({ unsubscribe: jest.fn() }) },
  gyroscope: { subscribe: () => ({ unsubscribe: jest.fn() }) },
  setUpdateIntervalForType: jest.fn(),
  SensorTypes: { accelerometer: 'a', gyroscope: 'g' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));
