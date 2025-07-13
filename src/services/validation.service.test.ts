import { ValidationService } from './validation.service';
import { PAYMENT_SOURCES } from '../constants/app.constants';

describe('ValidationService', () => {
  describe('validateAmount', () => {
    it('should return valid for positive number', () => {
      const result = ValidationService.validateAmount(100);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for negative number', () => {
      const result = ValidationService.validateAmount(-50);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a positive number');
    });

    it('should return invalid for zero', () => {
      const result = ValidationService.validateAmount(0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a positive number');
    });
  });

  describe('validateCurrency', () => {
    it('should return valid for 3-letter uppercase currency', () => {
      const result = ValidationService.validateCurrency('USD');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for lowercase currency', () => {
      const result = ValidationService.validateCurrency('usd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Currency must be a 3-letter uppercase string (e.g., \'USD\')');
    });

    it('should return invalid for 2-letter currency', () => {
      const result = ValidationService.validateCurrency('US');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Currency must be a 3-letter uppercase string (e.g., \'USD\')');
    });
  });

  describe('validateSource', () => {
    it('should return valid for stripe', () => {
      const result = ValidationService.validateSource(PAYMENT_SOURCES.STRIPE);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for paypal', () => {
      const result = ValidationService.validateSource(PAYMENT_SOURCES.PAYPAL);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for other sources', () => {
      const result = ValidationService.validateSource('square');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(`Source must be either '${PAYMENT_SOURCES.STRIPE}' or '${PAYMENT_SOURCES.PAYPAL}'`);
    });
  });

  describe('validateEmail', () => {
    it('should return valid for correct email format', () => {
      const result = ValidationService.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for email without @', () => {
      const result = ValidationService.validateEmail('testexample.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email must be a valid email format');
    });

    it('should return invalid for email without domain', () => {
      const result = ValidationService.validateEmail('test@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email must be a valid email format');
    });
  });
}); 