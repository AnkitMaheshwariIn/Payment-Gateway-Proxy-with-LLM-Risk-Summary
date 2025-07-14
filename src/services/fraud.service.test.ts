import { FraudService } from './fraud.service';
import { ChargeRequest } from '../interfaces/charge.interface';

// Mock console.log to reduce noise in tests
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('FraudService', () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('calculateFraudScore', () => {
    const baseChargeData: ChargeRequest = {
      amount: 100,
      currency: 'USD',
      source: 'stripe',
      email: 'test@example.com'
    };

    it('should return score 0.1 for clean input (Suspicious Email Pattern only)', async () => {
      const result = await FraudService.calculateFraudScore(baseChargeData);
      expect(result.fraudScore).toBe(0.1);
      expect(result.riskPercentage).toBe(10);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['Suspicious Email Pattern']);
    });

    it('should add 0.3 (High Amount) + 0.1 (Suspicious Email Pattern) for high amount (>5000)', async () => {
      const highAmountData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000
      };
      const result = await FraudService.calculateFraudScore(highAmountData);
      expect(result.fraudScore).toBe(0.4);
      expect(result.riskPercentage).toBe(40);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules.sort()).toEqual(['High Amount', 'Suspicious Email Pattern'].sort());
    });

    it('should add 0.4 (Suspicious Email Domain) + 0.1 (Suspicious Email Pattern) for risky email domains (.ru)', async () => {
      const riskyDomainData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@example.ru'
      };
      const result = await FraudService.calculateFraudScore(riskyDomainData);
      expect(result.fraudScore).toBe(0.5);
      expect(result.riskPercentage).toBe(50);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules.sort()).toEqual(['Suspicious Email Domain', 'Suspicious Email Pattern'].sort());
    });

    it('should add 0.4 (Suspicious Email Domain) + 0.1 (Suspicious Email Pattern) for risky email domains (.xyz)', async () => {
      const riskyDomainData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@example.xyz'
      };
      const result = await FraudService.calculateFraudScore(riskyDomainData);
      expect(result.fraudScore).toBe(0.5);
      expect(result.riskPercentage).toBe(50);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules.sort()).toEqual(['Suspicious Email Domain', 'Suspicious Email Pattern'].sort());
    });

    it('should add 0.2 (Unsupported Currency) + 0.1 (Suspicious Email Pattern) for unsupported currency', async () => {
      const unsupportedCurrencyData: ChargeRequest = {
        ...baseChargeData,
        currency: 'GBP'
      };
      const result = await FraudService.calculateFraudScore(unsupportedCurrencyData);
      expect(result.fraudScore).toBe(0.30000000000000004);
      expect(result.riskPercentage).toBe(30);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules.sort()).toEqual(['Unsupported Currency', 'Suspicious Email Pattern'].sort());
    });

    it('should combine multiple risk factors', async () => {
      const multipleRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000,
        email: 'test@example.ru',
        currency: 'GBP'
      };
      const result = await FraudService.calculateFraudScore(multipleRiskData);
      const expectedScore = 0.3 + 0.4 + 0.2 + 0.1; // High Amount + Suspicious Email Domain + Unsupported Currency + Suspicious Email Pattern
      expect(result.fraudScore).toBeCloseTo(expectedScore);
      expect(result.riskPercentage).toBe(100);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules.sort()).toEqual(['High Amount', 'Suspicious Email Domain', 'Unsupported Currency', 'Suspicious Email Pattern'].sort());
    });

    it('should handle case-insensitive email domain matching', async () => {
      const mixedCaseData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@EXAMPLE.RU'
      };
      const result = await FraudService.calculateFraudScore(mixedCaseData);
      expect(result.fraudScore).toBe(0.5);
      expect(result.triggeredRules.sort()).toEqual(['Suspicious Email Domain', 'Suspicious Email Pattern'].sort());
    });

    it('should handle email without domain gracefully', async () => {
      const invalidEmailData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@'
      };
      const result = await FraudService.calculateFraudScore(invalidEmailData);
      expect(result.fraudScore).toBe(0.1);
      expect(result.triggeredRules).toEqual(['Suspicious Email Pattern']);
    });

    it('should mark as high risk when score >= 0.5', async () => {
      const highRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000,
        email: 'test@example.ru'
      };
      const result = await FraudService.calculateFraudScore(highRiskData);
      expect(result.fraudScore).toBeCloseTo(0.8);
      expect(result.isHighRisk).toBe(true);
    });

    it('should not mark as high risk when score < 0.5', async () => {
      const lowRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000
      };
      const result = await FraudService.calculateFraudScore(lowRiskData);
      expect(result.fraudScore).toBe(0.4);
      expect(result.isHighRisk).toBe(false);
    });

    it('should accept all standard currencies without penalty except for Suspicious Email Pattern', async () => {
      const standardCurrencies = ['USD', 'EUR', 'INR'];
      for (const currency of standardCurrencies) {
        const standardCurrencyData: ChargeRequest = {
          ...baseChargeData,
          currency
        };
        const result = await FraudService.calculateFraudScore(standardCurrencyData);
        expect(result.fraudScore).toBe(0.1);
        expect(result.triggeredRules).not.toContain('Unsupported Currency');
      }
    });

    it('should detect all risky domains and add Suspicious Email Pattern', async () => {
      const riskyDomains = ['.ru', '.xyz'];
      for (const domain of riskyDomains) {
        const riskyDomainData: ChargeRequest = {
          ...baseChargeData,
          email: `test@example${domain}`
        };
        const result = await FraudService.calculateFraudScore(riskyDomainData);
        expect(result.fraudScore).toBe(0.5);
        expect(result.triggeredRules.sort()).toEqual(['Suspicious Email Domain', 'Suspicious Email Pattern'].sort());
      }
    });

    it('should handle very high amounts (>10000) and add Suspicious Email Pattern', async () => {
      const veryHighAmountData: ChargeRequest = {
        ...baseChargeData,
        amount: 15000
      };
      const result = await FraudService.calculateFraudScore(veryHighAmountData);
      expect(result.fraudScore).toBe(0.9); // Very High Amount (0.5) + High Amount (0.3) + Suspicious Email Pattern (0.1)
      expect(result.riskPercentage).toBe(90);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules.sort()).toEqual(['Very High Amount', 'High Amount', 'Suspicious Email Pattern'].sort());
    });

    it('should detect suspicious email patterns', async () => {
      const suspiciousEmailData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@example.com'
      };
      const result = await FraudService.calculateFraudScore(suspiciousEmailData);
      expect(result.fraudScore).toBe(0.1); // Suspicious Email Pattern rule
      expect(result.triggeredRules).toEqual(['Suspicious Email Pattern']);
    });

    it('should handle non-standard payment sources and add Suspicious Email Pattern', async () => {
      const nonStandardSourceData: ChargeRequest = {
        ...baseChargeData,
        source: 'square'
      };
      const result = await FraudService.calculateFraudScore(nonStandardSourceData);
      expect(result.fraudScore).toBe(0.4);
      expect(result.triggeredRules.sort()).toEqual(['Non-Standard Payment Source', 'Suspicious Email Pattern'].sort());
    });

    it('should handle different order of triggered rules consistently', async () => {
      const data1: ChargeRequest = {
        ...baseChargeData,
        amount: 6000,
        email: 'test@example.ru'
      };

      const data2: ChargeRequest = {
        ...baseChargeData,
        email: 'test@example.ru',
        amount: 6000
      };

      const result1 = await FraudService.calculateFraudScore(data1);
      const result2 = await FraudService.calculateFraudScore(data2);

      expect(result1.fraudScore).toBe(result2.fraudScore);
      expect(result1.triggeredRules.sort()).toEqual(result2.triggeredRules.sort());
    });
  });

  describe('Rule management', () => {
    it('should load rules from configuration file', async () => {
      const rules = await FraudService.getLoadedRules();
      
      expect(rules).toBeInstanceOf(Array);
      expect(rules.length).toBeGreaterThan(0);
      
      // Check that rules have the expected structure
      rules.forEach(rule => {
        expect(rule).toHaveProperty('label');
        expect(rule).toHaveProperty('condition');
        expect(rule).toHaveProperty('score');
        expect(typeof rule.label).toBe('string');
        expect(typeof rule.condition).toBe('string');
        expect(typeof rule.score).toBe('number');
      });
    });

    it('should reload rules when requested', async () => {
      const initialRules = await FraudService.getLoadedRules();
      
      await FraudService.reloadRules();
      
      const reloadedRules = await FraudService.getLoadedRules();
      
      expect(reloadedRules).toEqual(initialRules);
    });
  });
}); 