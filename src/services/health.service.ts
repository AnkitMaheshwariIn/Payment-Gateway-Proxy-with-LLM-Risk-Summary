import { LLMService } from './llm.service';
import { LLM_CONFIG } from '../constants/app.constants';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: Date;
}

export interface OverallHealthStatus {
  overall: 'healthy' | 'unhealthy';
  checks: HealthCheckResult[];
  timestamp: Date;
}

/**
 * Service class for health checks and dependency validation.
 * Tests critical services like OpenAI API on server startup.
 */
export class HealthService {
  /**
   * Performs comprehensive health checks for all critical services.
   * Tests OpenAI API connectivity and configuration.
   * 
   * @returns Promise<OverallHealthStatus> - Overall health status with detailed results
   */
  public static async performHealthChecks(): Promise<OverallHealthStatus> {
    const checks: HealthCheckResult[] = [];
    
    // Test OpenAI API connection
    const openaiCheck = await this.testOpenAIConnection();
    checks.push(openaiCheck);
    
    // Determine overall health status
    const overall = checks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';
    
    return {
      overall,
      checks,
      timestamp: new Date()
    };
  }

  /**
   * Tests OpenAI API connection by making a simple test request.
   * Validates API key and network connectivity.
   * 
   * @returns Promise<HealthCheckResult> - OpenAI health check result
   * @private
   */
  private static async testOpenAIConnection(): Promise<HealthCheckResult> {
    try {
      // Check if API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return {
          service: 'OpenAI API',
          status: 'unhealthy',
          message: 'OPENAI_API_KEY environment variable is not set',
          timestamp: new Date()
        };
      }

      // Test with a simple prompt to validate API key and connectivity
      const testExplanation = await LLMService.generateFraudExplanation(
        100,
        'USD',
        'test@example.com',
        0.0,
        []
      );

      // If we get a response, the API is working
      if (testExplanation && testExplanation.length > 0) {
        return {
          service: 'OpenAI API',
          status: 'healthy',
          message: `Successfully connected to OpenAI API (${LLM_CONFIG.MODEL})`,
          timestamp: new Date()
        };
      } else {
        return {
          service: 'OpenAI API',
          status: 'unhealthy',
          message: 'OpenAI API returned empty response',
          timestamp: new Date()
        };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        service: 'OpenAI API',
        status: 'unhealthy',
        message: `OpenAI API connection failed: ${errorMessage}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Logs health check results in a formatted way.
   * 
   * @param healthStatus - Overall health status to log
   */
  public static logHealthStatus(healthStatus: OverallHealthStatus): void {
    console.log('\n🔍 Health Check Results:');
    console.log('='.repeat(50));
    
    healthStatus.checks.forEach(check => {
      const statusIcon = check.status === 'healthy' ? '✅' : '❌';
      console.log(`${statusIcon} ${check.service}: ${check.status.toUpperCase()}`);
      console.log(`   ${check.message}`);
    });
    
    console.log('='.repeat(50));
    const overallIcon = healthStatus.overall === 'healthy' ? '✅' : '❌';
    console.log(`${overallIcon} Overall Status: ${healthStatus.overall.toUpperCase()}`);
    console.log(`⏰ Timestamp: ${healthStatus.timestamp.toISOString()}`);
    console.log('');
  }
} 