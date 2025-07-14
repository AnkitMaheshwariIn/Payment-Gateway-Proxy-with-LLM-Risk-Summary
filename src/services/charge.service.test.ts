import { ChargeService } from './charge.service';
import { ChargeRequest } from '../interfaces/charge.interface';
import { PAYMENT_SOURCES } from '../constants/app.constants';

describe('ChargeService', () => {
  const validChargeData: ChargeRequest = {
    amount: 100,
    currency: 'USD',
    source: PAYMENT_SOURCES.STRIPE,
    email: 'user@company.com'
  };

  describe('processCharge', () => {
    it('should return safe for a valid charge', async () => {
      const result = await ChargeService.processCharge(validChargeData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({
        transactionId: expect.any(String),
        amount: validChargeData.amount,
        currency: validChargeData.currency,
        status: 'safe',
        fraudScore: expect.any(Number),
        triggeredRules: expect.any(Array),
        llmExplanation: expect.any(String)
      }));
    });

    it('should return error for invalid amount', async () => {
      const result = await ChargeService.processCharge({ ...validChargeData, amount: -50 });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Amount must be a positive number');
    });

    it('should return error for invalid currency', async () => {
      const result = await ChargeService.processCharge({ ...validChargeData, currency: 'US' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Currency must be a 3-letter uppercase string (e.g., \'USD\')');
    });

    it('should return error for invalid source', async () => {
      const result = await ChargeService.processCharge({ ...validChargeData, source: 'square' });
      expect(result.success).toBe(false);
      expect(result.message).toBe(`Source must be either '${PAYMENT_SOURCES.STRIPE}' or '${PAYMENT_SOURCES.PAYPAL}'`);
    });

    it('should return error for invalid email', async () => {
      const result = await ChargeService.processCharge({ ...validChargeData, email: 'invalid-email' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email must be a valid email format');
    });

    it('should return safe for paypal as source', async () => {
      const paypalData = { ...validChargeData, source: PAYMENT_SOURCES.PAYPAL };
      const result = await ChargeService.processCharge(paypalData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({
        transactionId: expect.any(String),
        amount: paypalData.amount,
        currency: paypalData.currency,
        status: 'safe',
        fraudScore: expect.any(Number),
        triggeredRules: expect.any(Array),
        llmExplanation: expect.any(String)
      }));
    });
  });
}); 