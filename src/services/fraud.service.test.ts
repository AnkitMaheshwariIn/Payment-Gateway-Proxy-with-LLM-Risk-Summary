import { FraudService } from './fraud.service';
import { ChargeRequest } from '../interfaces/charge.interface';
import { 
  FRAUD_SCORING, 
  RISKY_DOMAINS, 
  STANDARD_CURRENCIES 
} from '../constants/app.constants';

describe('FraudService', () => {
  const baseChargeData: ChargeRequest = {
    amount: 100,
    currency: 'USD',
    source: 'stripe',
    email: 'test@example.com'
  };

  describe('calculateFraudScore', () => {
    it('should return 0 score for low-risk transaction', () => {
      const result = FraudService.calculateFraudScore(baseChargeData);
      expect(result.fraudScore).toBe(0);
      expect(result.riskPercentage).toBe(0);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual([]);
    });

    it('should add score for high amount', () => {
      const highAmountData = { ...baseChargeData, amount: 6000 };
      const result = FraudService.calculateFraudScore(highAmountData);
      expect(result.fraudScore).toBe(FRAUD_SCORING.HIGH_AMOUNT_SCORE);
      expect(result.riskPercentage).toBe(FRAUD_SCORING.HIGH_AMOUNT_SCORE * 100);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['High Amount']);
    });

    it('should add score for risky email domain (.ru)', () => {
      const riskyEmailData = { ...baseChargeData, email: 'test@example.ru' };
      const result = FraudService.calculateFraudScore(riskyEmailData);
      expect(result.fraudScore).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE);
      expect(result.riskPercentage).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE * 100);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['Suspicious Email Domain']);
    });

    it('should add score for risky email domain (.xyz)', () => {
      const riskyEmailData = { ...baseChargeData, email: 'test@example.xyz' };
      const result = FraudService.calculateFraudScore(riskyEmailData);
      expect(result.fraudScore).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE);
      expect(result.riskPercentage).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE * 100);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['Suspicious Email Domain']);
    });

    it('should add score for non-standard currency', () => {
      const nonStandardCurrencyData = { ...baseChargeData, currency: 'GBP' };
      const result = FraudService.calculateFraudScore(nonStandardCurrencyData);
      expect(result.fraudScore).toBe(FRAUD_SCORING.NON_STANDARD_CURRENCY_SCORE);
      expect(result.riskPercentage).toBe(FRAUD_SCORING.NON_STANDARD_CURRENCY_SCORE * 100);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['Unsupported Currency']);
    });

    it('should not add score for standard currencies', () => {
      STANDARD_CURRENCIES.forEach(currency => {
        const standardCurrencyData = { ...baseChargeData, currency };
        const result = FraudService.calculateFraudScore(standardCurrencyData);
        expect(result.fraudScore).toBe(0);
        expect(result.isHighRisk).toBe(false);
        expect(result.triggeredRules).toEqual([]);
      });
    });

    it('should combine multiple risk factors', () => {
      const highRiskData = {
        ...baseChargeData,
        amount: 6000,
        email: 'test@example.ru',
        currency: 'GBP'
      };
      const result = FraudService.calculateFraudScore(highRiskData);
      const expectedScore = FRAUD_SCORING.HIGH_AMOUNT_SCORE + 
                           FRAUD_SCORING.RISKY_DOMAIN_SCORE + 
                           FRAUD_SCORING.NON_STANDARD_CURRENCY_SCORE;
      expect(result.fraudScore).toBe(expectedScore);
      expect(result.riskPercentage).toBe(expectedScore * 100);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules).toEqual(['High Amount', 'Suspicious Email Domain', 'Unsupported Currency']);
    });

    it('should mark as high risk when score >= 0.5', () => {
      const highRiskData = {
        ...baseChargeData,
        amount: 6000,
        email: 'test@example.ru'
      };
      const result = FraudService.calculateFraudScore(highRiskData);
      const expectedScore = FRAUD_SCORING.HIGH_AMOUNT_SCORE + FRAUD_SCORING.RISKY_DOMAIN_SCORE;
      expect(result.fraudScore).toBe(expectedScore);
      expect(result.isHighRisk).toBe(true);
      expect(result.triggeredRules).toEqual(['High Amount', 'Suspicious Email Domain']);
    });

    it('should handle case-insensitive email domains', () => {
      const riskyEmailData = { ...baseChargeData, email: 'test@EXAMPLE.RU' };
      const result = FraudService.calculateFraudScore(riskyEmailData);
      expect(result.fraudScore).toBe(FRAUD_SCORING.RISKY_DOMAIN_SCORE);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual(['Suspicious Email Domain']);
    });

    it('should handle invalid email format gracefully', () => {
      const invalidEmailData = { ...baseChargeData, email: 'invalid-email' };
      const result = FraudService.calculateFraudScore(invalidEmailData);
      expect(result.fraudScore).toBe(0);
      expect(result.isHighRisk).toBe(false);
      expect(result.triggeredRules).toEqual([]);
    });
  });
}); 