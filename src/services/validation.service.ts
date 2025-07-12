import { ValidationResult } from '../interfaces/charge.interface';
import { 
  PAYMENT_SOURCES, 
  VALID_PAYMENT_SOURCES, 
  CURRENCY_FORMAT, 
  EMAIL_FORMAT, 
  AMOUNT_VALIDATION 
} from '../constants/app.constants';

export class ValidationService {
  private static isValidEmail(email: string): boolean {
    return EMAIL_FORMAT.PATTERN.test(email);
  }

  private static isValidCurrency(currency: string): boolean {
    return CURRENCY_FORMAT.PATTERN.test(currency);
  }

  private static isValidSource(source: string): boolean {
    return VALID_PAYMENT_SOURCES.includes(source as any);
  }

  public static validateAmount(amount: number): ValidationResult {
    if (typeof amount !== 'number' || amount <= AMOUNT_VALIDATION.MIN_VALUE) {
      return {
        isValid: false,
        error: `Amount must be a ${AMOUNT_VALIDATION.DESCRIPTION}`
      };
    }
    return { isValid: true };
  }

  public static validateCurrency(currency: string): ValidationResult {
    if (typeof currency !== 'string' || !this.isValidCurrency(currency)) {
      return {
        isValid: false,
        error: `Currency must be a ${CURRENCY_FORMAT.DESCRIPTION}`
      };
    }
    return { isValid: true };
  }

  public static validateSource(source: string): ValidationResult {
    if (typeof source !== 'string' || !this.isValidSource(source)) {
      return {
        isValid: false,
        error: `Source must be either '${PAYMENT_SOURCES.STRIPE}' or '${PAYMENT_SOURCES.PAYPAL}'`
      };
    }
    return { isValid: true };
  }

  public static validateEmail(email: string): ValidationResult {
    if (typeof email !== 'string' || !this.isValidEmail(email)) {
      return {
        isValid: false,
        error: `Email must be a ${EMAIL_FORMAT.DESCRIPTION}`
      };
    }
    return { isValid: true };
  }
} 