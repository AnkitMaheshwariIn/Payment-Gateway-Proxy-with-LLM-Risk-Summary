import { ChargeService } from './charge.service';
import { ChargeRequest } from '../interfaces/charge.interface';

describe('ChargeService', () => {
  const validChargeData: ChargeRequest = {
    amount: 100,
    currency: 'USD',
    source: 'stripe',
    email: 'test@example.com'
  };

  describe('processCharge', () => {
    it('should return valid status for valid data', () => {
      const result = ChargeService.processCharge(validChargeData);
      expect(result.status).toBe('valid');
      expect(result.data).toEqual(validChargeData);
    });

    it('should return error for invalid amount', () => {
      const invalidData = { ...validChargeData, amount: -50 };
      const result = ChargeService.processCharge(invalidData);
      expect(result.status).toBe('error');
      expect(result.error).toBe('Amount must be a positive number');
    });

    it('should return error for invalid currency', () => {
      const invalidData = { ...validChargeData, currency: 'usd' };
      const result = ChargeService.processCharge(invalidData);
      expect(result.status).toBe('error');
      expect(result.error).toBe('Currency must be a 3-letter string (e.g., \'USD\')');
    });

    it('should return error for invalid source', () => {
      const invalidData = { ...validChargeData, source: 'square' };
      const result = ChargeService.processCharge(invalidData);
      expect(result.status).toBe('error');
      expect(result.error).toBe('Source must be either \'stripe\' or \'paypal\'');
    });

    it('should return error for invalid email', () => {
      const invalidData = { ...validChargeData, email: 'invalid-email' };
      const result = ChargeService.processCharge(invalidData);
      expect(result.status).toBe('error');
      expect(result.error).toBe('Email must be a valid email format');
    });

    it('should accept paypal as valid source', () => {
      const paypalData = { ...validChargeData, source: 'paypal' };
      const result = ChargeService.processCharge(paypalData);
      expect(result.status).toBe('valid');
      expect(result.data).toEqual(paypalData);
    });
  });
}); 