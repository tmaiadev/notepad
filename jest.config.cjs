module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.cjs',
  },
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/main\\.jsx$',
    'src/Toolbar/index\\.js$',
  ],
  coverageThreshold: {
    global: {
      lines: 100,
    },
  },
}
