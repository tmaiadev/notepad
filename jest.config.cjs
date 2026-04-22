module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.cjs',
  },
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/main\\.tsx$',
    'src/components/Toolbar/index\\.ts$',
    'src/test-utils\\.tsx$',
  ],
  coverageThreshold: {
    global: {
      lines: 100,
    },
  },
}
