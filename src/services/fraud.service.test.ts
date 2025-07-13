import { FraudService } from './fraud.service';
import { ChargeRequest } from '../interfaces/charge.interface';
import { FRAUD_SCORING, RISKY_DOMAINS, STANDARD_CURRENCIES } from '../constants/app.constants';

describe('FraudService', () => {
  describe('calculateFraudScore', () => {
    const baseChargeData: ChargeRequest = {
      amount: 100,
      currency: 'USD',
      source: 'stripe',
      email: 'test@example.com'
    };

    it('should return score 0 for clean input', () => {
      const result = FraudService.calculateFraudScore(baseChargeData);

      expect(result.fraudScore).toBe(0);
      expect(result.riskPercentage).toBe(0);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual([]);
    });

    it('should add 0.3 for high amount (>5000)', () => {
      const highAmountData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000
      };

      const result = FraudService.calculateFraudScore(highAmountData);

      expect(result.fraudScore).toBe(FRAUD_SCORING.HIGH_AMOUNT_SCORE);
      expect(result.riskPercentage).toBe(30);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['High Amount']);
    });

    it('should add 0.4 for risky email domains (.ru)', () => {
      const riskyDomainData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@example.ru'
      };

      const result = FraudService.calculateFraudScore(riskyDomainData);

      expect(result.fraudScore).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE);
      expect(result.riskPercentage).toBe(40);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['Suspicious Email Domain']);
    });

    it('should add 0.4 for risky email domains (.xyz)', () => {
      const riskyDomainData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@example.xyz'
      };

      const result = FraudService.calculateFraudScore(riskyDomainData);

      expect(result.fraudScore).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE);
      expect(result.riskPercentage).toBe(40);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['Suspicious Email Domain']);
    });

    it('should add 0.2 for unsupported currency', () => {
      const unsupportedCurrencyData: ChargeRequest = {
        ...baseChargeData,
        currency: 'GBP'
      };

      const result = FraudService.calculateFraudScore(unsupportedCurrencyData);

      expect(result.fraudScore).toBe(FRAUD_SCORING.NON_STANDARD_CURRENCY_SCORE);
      expect(result.riskPercentage).toBe(20);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['Unsupported Currency']);
    });

    it('should combine multiple risk factors', () => {
      const multipleRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000,
        email: 'test@example.ru',
        currency: 'GBP'
      };

      const result = FraudService.calculateFraudScore(multipleRiskData);

      const expectedScore = FRAUD_SCORING.HIGH_AMOUNT_SCORE + 
                           FRAUD_SCORING.RISKY_DOMAIN_SCORE + 
                           FRAUD_SCORING.NON_STANDARD_CURRENCY_SCORE;
      
      expect(result.fraudScore).toBe(expectedScore);
      expect(result.riskPercentage).toBe(90);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules).toEqual([
        'High Amount',
        'Suspicious Email Domain',
        'Unsupported Currency'
      ]);
    });

    it('should handle case-insensitive email domain matching', () => {
      const mixedCaseData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@EXAMPLE.RU'
      };

      const result = FraudService.calculateFraudScore(mixedCaseData);

      expect(result.fraudScore).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE);
      expect(result.triggeredRules).toEqual(['Suspicious Email Domain']);
    });

    it('should handle email without domain gracefully', () => {
      const invalidEmailData: ChargeRequest = {
        ...baseChargeData,
        email: 'test@'
      };

      const result = FraudService.calculateFraudScore(invalidEmailData);

      expect(result.fraudScore).toBe(0);
      expect(result.triggeredRules).toEqual([]);
    });

    it('should mark as high risk when score >= 0.5', () => {
      const highRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000,
        email: 'test@example.ru'
      };

      const result = FraudService.calculateFraudScore(highRiskData);

      expect(result.fraudScore).toBe(0.7);
      expect(result.isHighRisk).toBe(true);
    });

    it('should not mark as high risk when score < 0.5', () => {
      const lowRiskData: ChargeRequest = {
        ...baseChargeData,
        amount: 6000
      };

      const result = FraudService.calculateFraudScore(lowRiskData);

      expect(result.fraudScore).toBe(0.3);
      expect(result.isHighRisk).toBe(false);
    });

    it('should accept all standard currencies without penalty', () => {
      STANDARD_CURRENCIES.forEach(currency => {
        const standardCurrencyData: ChargeRequest = {
          ...baseChargeData,
          currency
        };

        const result = FraudService.calculateFraudScore(standardCurrencyData);

        expect(result.fraudScore).toBe(0);
        expect(result.triggeredRules).not.toContain('Unsupported Currency');
      });
    });

    it('should detect all risky domains', () => {
      RISKY_DOMAINS.forEach(domain => {
        const riskyDomainData: ChargeRequest = {
          ...baseChargeData,
          email: `test@example${domain}`
        };

        const result = FraudService.calculateFraudScore(riskyDomainData);

        expect(result.fraudScore).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE);
        expect(result.triggeredRules).toEqual(['Suspicious Email Domain']);
      });
    });
  });
}); 