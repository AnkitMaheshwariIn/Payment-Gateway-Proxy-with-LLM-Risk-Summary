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
      email: 'user@company.com'
    };

    it('should return score 0 for clean input', async () => {
      const result = await FraudService.calculateFraudScore(baseChargeData);
      expect(result.fraudScore).toBe(0);
      expect(result.riskPercentage).toBe(0);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual([]);
    });

    it('should add 0.3 (High Amount) for high amount (>5000)', async () => {
      const highAmountData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000
      };
      const result = await FraudService.calculateFraudScore(highAmountData);
      expect(result.fraudScore).toBe(0.3);
      expect(result.riskPercentage).toBe(30);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules.sort()).toEqual(['High Amount'].sort());
    });

    it('should add 0.4 (Suspicious Email Domain) for risky email domains (.ru)', async () => {
      const riskyDomainData: ChargeRequest = {
        ...baseChargeData,
        email: 'customer@example.ru'
      };
      const result = await FraudService.calculateFraudScore(riskyDomainData);
      expect(result.fraudScore).toBe(0.4);
      expect(result.riskPercentage).toBe(40);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules.sort()).toEqual(['Suspicious Email Domain'].sort());
    });

    it('should add 0.4 (Suspicious Email Domain) for risky email domains (.xyz)', async () => {
      const riskyDomainData: ChargeRequest = {
        ...baseChargeData,
        email: 'customer@example.xyz'
      };
      const result = await FraudService.calculateFraudScore(riskyDomainData);
      expect(result.fraudScore).toBe(0.4);
      expect(result.riskPercentage).toBe(40);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules.sort()).toEqual(['Suspicious Email Domain'].sort());
    });

    it('should add 0.2 (Unsupported Currency) for unsupported currency', async () => {
      const unsupportedCurrencyData: ChargeRequest = {
        ...baseChargeData,
        currency: 'JPY'
      };
      const result = await FraudService.calculateFraudScore(unsupportedCurrencyData);
      expect(result.fraudScore).toBe(0.2);
      expect(result.riskPercentage).toBe(20);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules.sort()).toEqual(['Unsupported Currency'].sort());
    });

    it('should combine multiple risk factors', async () => {
      const multipleRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000,
        email: 'customer@example.ru',
        currency: 'JPY'
      };
      const result = await FraudService.calculateFraudScore(multipleRiskData);
      const expectedScore = 0.3 + 0.4 + 0.2; // High Amount + Suspicious Email Domain + Unsupported Currency
      expect(result.fraudScore).toBeCloseTo(expectedScore);
      expect(result.riskPercentage).toBe(90);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules.sort()).toEqual(['High Amount', 'Suspicious Email Domain', 'Unsupported Currency'].sort());
    });

    it('should handle case-insensitive email domain matching', async () => {
      const mixedCaseData: ChargeRequest = {
        ...baseChargeData,
        email: 'customer@EXAMPLE.RU'
      };
      const result = await FraudService.calculateFraudScore(mixedCaseData);
      expect(result.fraudScore).toBe(0.4);
      expect(result.triggeredRules.sort()).toEqual(['Suspicious Email Domain'].sort());
    });

    it('should handle email without domain gracefully', async () => {
      const invalidEmailData: ChargeRequest = {
        ...baseChargeData,
        email: 'customer@'
      };
      const result = await FraudService.calculateFraudScore(invalidEmailData);
      expect(result.fraudScore).toBe(0);
      expect(result.triggeredRules).toEqual([]);
    });

    it('should mark as high risk when score >= 0.5', async () => {
      const highRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000,
        email: 'customer@example.ru'
      };
      const result = await FraudService.calculateFraudScore(highRiskData);
      expect(result.fraudScore).toBeCloseTo(0.7);
      expect(result.isHighRisk).toBe(true);
    });

    it('should not mark as high risk when score < 0.5', async () => {
      const lowRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000
      };
      const result = await FraudService.calculateFraudScore(lowRiskData);
      expect(result.fraudScore).toBe(0.3);
      expect(result.isHighRisk).toBe(false);
    });

    it('should accept all standard currencies without penalty', async () => {
      const standardCurrencies = ['USD', 'EUR', 'INR'];
      for (const currency of standardCurrencies) {
        const standardCurrencyData: ChargeRequest = {
          ...baseChargeData,
          currency
        };
        const result = await FraudService.calculateFraudScore(standardCurrencyData);
        expect(result.fraudScore).toBe(0);
        expect(result.triggeredRules).not.toContain('Unsupported Currency');
      }
    });

    it('should detect all risky domains', async () => {
      const riskyDomains = ['.ru', '.xyz'];
      for (const domain of riskyDomains) {
        const riskyDomainData: ChargeRequest = {
          ...baseChargeData,
          email: `customer@example${domain}`
        };
        const result = await FraudService.calculateFraudScore(riskyDomainData);
        expect(result.fraudScore).toBe(0.4);
        expect(result.triggeredRules.sort()).toEqual(['Suspicious Email Domain'].sort());
      }
    });

    it('should handle very high amounts (>10000)', async () => {
      const veryHighAmountData: ChargeRequest = {
        ...baseChargeData,
        amount: 15000
      };
      const result = await FraudService.calculateFraudScore(veryHighAmountData);
      expect(result.fraudScore).toBe(0.5); // Only Very High Amount (0.5) should trigger
      expect(result.riskPercentage).toBe(50);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules.sort()).toEqual(['Very High Amount'].sort());
    });

    it('should detect suspicious email patterns', async () => {
      const suspiciousEmailData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@company.com'
      };
      const result = await FraudService.calculateFraudScore(suspiciousEmailData);
      expect(result.fraudScore).toBe(0.1); // Suspicious Email Pattern rule
      expect(result.triggeredRules).toEqual(['Suspicious Email Pattern']);
    });

    it('should handle non-standard payment sources', async () => {
      const nonStandardSourceData: ChargeRequest = {
        ...baseChargeData,
        source: 'square'
      };
      const result = await FraudService.calculateFraudScore(nonStandardSourceData);
      expect(result.fraudScore).toBe(0.3);
      expect(result.triggeredRules.sort()).toEqual(['Non-Standard Payment Source'].sort());
    });

    it('should handle different order of triggered rules consistently', async () => {
      const data1: ChargeRequest = {
        ...baseChargeData,
        amount: 6000,
        email: 'customer@example.ru'
      };

      const data2: ChargeRequest = {
        ...baseChargeData,
        email: 'customer@example.ru',
        amount: 6000
      };

      const result1 = await FraudService.calculateFraudScore(data1);
      const result2 = await FraudService.calculateFraudScore(data2);

      expect(result1.fraudScore).toBe(result2.fraudScore);
      expect(result1.triggeredRules.sort()).toEqual(result2.triggeredRules.sort());
    });

    it('should cap risk percentage at 100 and fraudScore at 1.0', async () => {
      // This input triggers all rules
      const allRiskData: ChargeRequest = {
        amount: 20000, // triggers High Amount + Very High Amount
        currency: 'JPY', // triggers Unsupported Currency
        source: 'square', // triggers Non-Standard Payment Source
        email: 'test@fraud.nett' // triggers Suspicious Email Domain + Suspicious Email Pattern
      };
      const result = await FraudService.calculateFraudScore(allRiskData);
      expect(result.riskPercentage).toBe(100);
      expect(result.fraudScore).toBe(1.0);
      expect(result.isHighRisk).toBe(true);
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