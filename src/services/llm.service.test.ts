import { LLMService } from './llm.service';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('API Error'))
        }
      }
    }))
  };
});

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('LLMService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Clear cache before each test to ensure clean state
    LLMService.clearCache();
    // Mock console.log
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateFraudExplanation', () => {
    it('should generate explanation for high-risk transaction', async () => {
      const explanation = await LLMService.generateFraudExplanation(
        6000,
        'GBP',
        'test@example.ru',
        0.9,
        ['High Amount', 'Suspicious Email Domain', 'Unsupported Currency']
      );

      expect(explanation).toContain('Transaction flagged with 90% risk due to high amount, suspicious email domain, unsupported currency');
    });

    it('should generate explanation for low-risk transaction', async () => {
      const explanation = await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        []
      );

      expect(explanation).toContain('Transaction appears safe with 0% risk score and no specific risk factors detected');
    });

    it('should handle API errors gracefully with fallback', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = require('openai').default;
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      }));

      const explanation = await LLMService.generateFraudExplanation(
        6000,
        'GBP',
        'test@example.ru',
        0.9,
        ['High Amount', 'Suspicious Email Domain']
      );

      expect(explanation).toContain('Transaction flagged with 90% risk due to high amount, suspicious email domain');
    });

    it('should handle empty triggered rules', async () => {
      const explanation = await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        []
      );

      expect(explanation).toContain('Transaction appears safe with 0% risk score and no specific risk factors detected');
    });
  });

  describe('Caching functionality', () => {
    it('should cache explanations and return cached result for identical transactions', async () => {
      // First call should cache the explanation
      const explanation1 = await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount']
      );

      // Second call with identical parameters should return cached result
      const explanation2 = await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount']
      );

      expect(explanation1).toBe(explanation2);
      expect(LLMService.getCacheSize()).toBe(1);
    });

    it('should generate different cache keys for different transactions', async () => {
      // First transaction
      await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount']
      );

      // Second transaction with different amount
      await LLMService.generateFraudExplanation(
        200,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount']
      );

      // Third transaction with different email
      await LLMService.generateFraudExplanation(
        100,
        'USD',
        'different@example.com',
        0.0,
        ['High Amount']
      );

      expect(LLMService.getCacheSize()).toBe(3);
    });

    it('should handle different order of triggered rules with same cache key', async () => {
      // First call with rules in one order
      await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount', 'Suspicious Email Domain']
      );

      // Second call with rules in different order
      await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['Suspicious Email Domain', 'High Amount']
      );

      // Should use same cache key, so cache size should still be 1
      expect(LLMService.getCacheSize()).toBe(1);
    });

    it('should clear cache when clearCache is called', async () => {
      // Add some explanations to cache
      await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount']
      );

      await LLMService.generateFraudExplanation(
        200,
        'EUR',
        'test@example.com',
        0.0,
        ['Suspicious Email Domain']
      );

      expect(LLMService.getCacheSize()).toBe(2);

      // Clear cache
      LLMService.clearCache();

      expect(LLMService.getCacheSize()).toBe(0);
    });

    it('should return undefined for non-existent cache key', () => {
      const cachedExplanation = LLMService.getCachedExplanation('non-existent-key');
      expect(cachedExplanation).toBeUndefined();
    });

    it('should return cached explanation for existing key', async () => {
      // Generate and cache an explanation
      const explanation = await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount']
      );

      // Get the cache key (we'll construct it manually since it's private)
      const cacheKey = '100-USD-test@example.com-High Amount';
      
      const cachedExplanation = LLMService.getCachedExplanation(cacheKey);
      expect(cachedExplanation).toBe(explanation);
    });

    it('should log cache hits and misses', async () => {
      // First call - should log cache miss and storage
      await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount']
      );

      // Second call - should log cache hit
      await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        ['High Amount']
      );

      // Accept either fallback or normal cache log
      const logCalls = mockConsoleLog.mock.calls.flat();
      const foundCacheLog = logCalls.some(msg =>
        msg.includes('💾 Cached explanation for transaction: 100 USD to test@example.com') ||
        msg.includes('💾 Cached fallback explanation for transaction: 100 USD to test@example.com')
      );
      expect(foundCacheLog).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('📋 Using cached explanation for transaction: 100 USD to test@example.com')
      );
    });
  });
}); 