import { ChargeService } from './charge.service';
import { ChargeRequest } from '../interfaces/charge.interface';
import { PAYMENT_SOURCES, RESPONSE_STATUS } from '../constants/app.constants';

describe('ChargeService', () => {
  const validChargeData: ChargeRequest = {
    amount: 100,
    currency: 'USD',
    source: PAYMENT_SOURCES.STRIPE,
    email: 'test@example.com'
  };

  describe('processCharge', () => {
    it('should return safe for a valid charge', async () => {
      const result = await ChargeService.processCharge(validChargeData);
      expect(result.status).toBe(RESPONSE_STATUS.SAFE);
      expect(result.data).toEqual(validChargeData);
      expect(result.fraudScore).toBeGreaterThanOrEqual(0);
      expect(result.riskPercentage).toBeGreaterThanOrEqual(0);
      expect(typeof result.explanation).toBe('string');
    });

    it('should return error for invalid amount', async () => {
      const result = await ChargeService.processCharge({ ...validChargeData, amount: -50 });
      expect(result.status).toBe(RESPONSE_STATUS.ERROR);
      expect(result.error).toBe('Amount must be a positive number');
    });

    it('should return error for invalid currency', async () => {
      const result = await ChargeService.processCharge({ ...validChargeData, currency: 'US' });
      expect(result.status).toBe(RESPONSE_STATUS.ERROR);
      expect(result.error).toBe('Currency must be a 3-letter uppercase string (e.g., \'USD\')');
    });

    it('should return error for invalid source', async () => {
      const result = await ChargeService.processCharge({ ...validChargeData, source: 'square' });
      expect(result.status).toBe(RESPONSE_STATUS.ERROR);
      expect(result.error).toBe(`Source must be either '${PAYMENT_SOURCES.STRIPE}' or '${PAYMENT_SOURCES.PAYPAL}'`);
    });

    it('should return error for invalid email', async () => {
      const result = await ChargeService.processCharge({ ...validChargeData, email: 'invalid-email' });
      expect(result.status).toBe(RESPONSE_STATUS.ERROR);
      expect(result.error).toBe('Email must be a valid email format');
    });

    it('should return safe for paypal as source', async () => {
      const paypalData = { ...validChargeData, source: PAYMENT_SOURCES.PAYPAL };
      const result = await ChargeService.processCharge(paypalData);
      expect(result.status).toBe(RESPONSE_STATUS.SAFE);
      expect(result.data).toEqual(paypalData);
      expect(result.fraudScore).toBeGreaterThanOrEqual(0);
      expect(result.riskPercentage).toBeGreaterThanOrEqual(0);
      expect(typeof result.explanation).toBe('string');
    });
  });
}); 