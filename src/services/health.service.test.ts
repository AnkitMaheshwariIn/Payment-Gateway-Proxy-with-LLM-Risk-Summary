import { HealthService, OverallHealthStatus, HealthCheckResult } from './health.service';
import { LLMService } from './llm.service';

// Mock LLMService
jest.mock('./llm.service', () => ({
  LLMService: {
    generateFraudExplanation: jest.fn()
  }
}));

describe('HealthService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('performHealthChecks', () => {
    it('should return healthy status when all services are working', async () => {
      // Mock successful OpenAI response
      (LLMService.generateFraudExplanation as jest.Mock).mockResolvedValue(
        'Transaction appears safe with 0% risk score and no specific risk factors detected.'
      );
      
      process.env.OPENAI_API_KEY = 'test-api-key';

      const result = await HealthService.performHealthChecks();

      expect(result.overall).toBe('healthy');
      expect(result.checks).toHaveLength(1);
      expect(result.checks[0].service).toBe('OpenAI API');
      expect(result.checks[0].status).toBe('healthy');
      expect(result.checks[0].message).toContain('Successfully connected to OpenAI API');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should return unhealthy status when OpenAI API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;

      const result = await HealthService.performHealthChecks();

      expect(result.overall).toBe('unhealthy');
      expect(result.checks).toHaveLength(1);
      expect(result.checks[0].service).toBe('OpenAI API');
      expect(result.checks[0].status).toBe('unhealthy');
      expect(result.checks[0].message).toBe('OPENAI_API_KEY environment variable is not set');
    });

    it('should return unhealthy status when OpenAI API fails', async () => {
      // Mock OpenAI API failure
      (LLMService.generateFraudExplanation as jest.Mock).mockRejectedValue(
        new Error('API key is invalid')
      );
      
      process.env.OPENAI_API_KEY = 'invalid-api-key';

      const result = await HealthService.performHealthChecks();

      expect(result.overall).toBe('unhealthy');
      expect(result.checks).toHaveLength(1);
      expect(result.checks[0].service).toBe('OpenAI API');
      expect(result.checks[0].status).toBe('unhealthy');
      expect(result.checks[0].message).toContain('OpenAI API connection failed');
    });

    it('should return unhealthy status when OpenAI API returns empty response', async () => {
      // Mock empty response
      (LLMService.generateFraudExplanation as jest.Mock).mockResolvedValue('');
      
      process.env.OPENAI_API_KEY = 'test-api-key';

      const result = await HealthService.performHealthChecks();

      expect(result.overall).toBe('unhealthy');
      expect(result.checks).toHaveLength(1);
      expect(result.checks[0].service).toBe('OpenAI API');
      expect(result.checks[0].status).toBe('unhealthy');
      expect(result.checks[0].message).toBe('OpenAI API returned empty response');
    });
  });

  describe('logHealthStatus', () => {
    it('should log health status correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const mockHealthStatus: OverallHealthStatus = {
        overall: 'healthy',
        checks: [
          {
            service: 'OpenAI API',
            status: 'healthy',
            message: 'Successfully connected to OpenAI API (gpt-3.5-turbo)',
            timestamp: new Date('2024-01-01T00:00:00Z')
          }
        ],
        timestamp: new Date('2024-01-01T00:00:00Z')
      };

      HealthService.logHealthStatus(mockHealthStatus);

      expect(consoleSpy).toHaveBeenCalledWith('\n🔍 Health Check Results:');
      expect(consoleSpy).toHaveBeenCalledWith('='.repeat(50));
      expect(consoleSpy).toHaveBeenCalledWith('✅ OpenAI API: HEALTHY');
      expect(consoleSpy).toHaveBeenCalledWith('   Successfully connected to OpenAI API (gpt-3.5-turbo)');
      expect(consoleSpy).toHaveBeenCalledWith('✅ Overall Status: HEALTHY');

      consoleSpy.mockRestore();
    });

    it('should log unhealthy status correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const mockHealthStatus: OverallHealthStatus = {
        overall: 'unhealthy',
        checks: [
          {
            service: 'OpenAI API',
            status: 'unhealthy',
            message: 'OPENAI_API_KEY environment variable is not set',
            timestamp: new Date('2024-01-01T00:00:00Z')
          }
        ],
        timestamp: new Date('2024-01-01T00:00:00Z')
      };

      HealthService.logHealthStatus(mockHealthStatus);

      expect(consoleSpy).toHaveBeenCalledWith('❌ OpenAI API: UNHEALTHY');
      expect(consoleSpy).toHaveBeenCalledWith('   OPENAI_API_KEY environment variable is not set');
      expect(consoleSpy).toHaveBeenCalledWith('❌ Overall Status: UNHEALTHY');

      consoleSpy.mockRestore();
    });
  });
}); 