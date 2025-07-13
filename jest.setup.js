// Jest setup file
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key-for-jest';
process.env.PORT = '3001'; // Use different port for tests

// Suppress console logs during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}); 