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

describe('LLMService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
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
}); 