/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '\\.(png|jpg|jpeg|svg|gif|webp)$': '<rootDir>/__mocks__/fileMock.js',
    'react-native$': '<rootDir>/node_modules/react-native',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: ['module:metro-react-native-babel-preset'],
    }],
  },
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
};

module.exports = config;