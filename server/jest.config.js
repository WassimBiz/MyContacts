module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test).js'],
  verbose: true,
  testTimeout: 60000,
  // IMPORTANT : setup dans le même process que les tests
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
};
