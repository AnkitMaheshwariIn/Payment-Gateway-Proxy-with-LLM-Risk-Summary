import { ValidationResult } from '../interfaces/charge.interface';

export class ValidationService {
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidCurrency(currency: string): boolean {
    return /^[A-Z]{3}$/.test(currency);
  }

  private static isValidSource(source: string): boolean {
    return ['stripe', 'paypal'].includes(source);
  }

  public static validateAmount(amount: number): ValidationResult {
    if (typeof amount !== 'number' || amount <= 0) {
      return {
        isValid: false,
        error: 'Amount must be a positive number'
      };
    }
    return { isValid: true };
  }

  public static validateCurrency(currency: string): ValidationResult {
    if (typeof currency !== 'string' || !this.isValidCurrency(currency)) {
      return {
        isValid: false,
        error: 'Currency must be a 3-letter string (e.g., \'USD\')'
      };
    }
    return { isValid: true };
  }

  public static validateSource(source: string): ValidationResult {
    if (typeof source !== 'string' || !this.isValidSource(source)) {
      return {
        isValid: false,
        error: 'Source must be either \'stripe\' or \'paypal\''
      };
    }
    return { isValid: true };
  }

  public static validateEmail(email: string): ValidationResult {
    if (typeof email !== 'string' || !this.isValidEmail(email)) {
      return {
        isValid: false,
        error: 'Email must be a valid email format'
      };
    }
    return { isValid: true };
  }
} 