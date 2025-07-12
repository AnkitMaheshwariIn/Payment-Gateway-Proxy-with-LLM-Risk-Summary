import { ChargeRequest, ChargeResponse } from '../interfaces/charge.interface';
import { ValidationService } from './validation.service';

export class ChargeService {
  public static processCharge(chargeData: ChargeRequest): ChargeResponse {
    // Validate amount
    const amountValidation = ValidationService.validateAmount(chargeData.amount);
    if (!amountValidation.isValid) {
      return {
        status: 'error',
        error: amountValidation.error
      };
    }

    // Validate currency
    const currencyValidation = ValidationService.validateCurrency(chargeData.currency);
    if (!currencyValidation.isValid) {
      return {
        status: 'error',
        error: currencyValidation.error
      };
    }

    // Validate source
    const sourceValidation = ValidationService.validateSource(chargeData.source);
    if (!sourceValidation.isValid) {
      return {
        status: 'error',
        error: sourceValidation.error
      };
    }

    // Validate email
    const emailValidation = ValidationService.validateEmail(chargeData.email);
    if (!emailValidation.isValid) {
      return {
        status: 'error',
        error: emailValidation.error
      };
    }

    // If all validations pass, return success
    return {
      status: 'valid',
      data: chargeData
    };
  }
} 