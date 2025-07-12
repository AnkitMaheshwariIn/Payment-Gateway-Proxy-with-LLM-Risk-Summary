import { ChargeRequest, ChargeResponse } from '../interfaces/charge.interface';
import { ValidationService } from './validation.service';
import { FraudService } from './fraud.service';
import { RESPONSE_STATUS } from '../constants/app.constants';

export class ChargeService {
  public static processCharge(chargeData: ChargeRequest): ChargeResponse {
    // Validate amount
    const amountValidation = ValidationService.validateAmount(chargeData.amount);
    if (!amountValidation.isValid) {
      return {
        status: RESPONSE_STATUS.ERROR,
        error: amountValidation.error
      };
    }

    // Validate currency
    const currencyValidation = ValidationService.validateCurrency(chargeData.currency);
    if (!currencyValidation.isValid) {
      return {
        status: RESPONSE_STATUS.ERROR,
        error: currencyValidation.error
      };
    }

    // Validate source
    const sourceValidation = ValidationService.validateSource(chargeData.source);
    if (!sourceValidation.isValid) {
      return {
        status: RESPONSE_STATUS.ERROR,
        error: sourceValidation.error
      };
    }

    // Validate email
    const emailValidation = ValidationService.validateEmail(chargeData.email);
    if (!emailValidation.isValid) {
      return {
        status: RESPONSE_STATUS.ERROR,
        error: emailValidation.error
      };
    }

    // Calculate fraud score
    const fraudResult = FraudService.calculateFraudScore(chargeData);

    // If all validations pass, return success with fraud score
    return {
      status: RESPONSE_STATUS.VALID,
      data: chargeData,
      fraudScore: fraudResult.fraudScore,
      riskPercentage: fraudResult.riskPercentage
    };
  }
} 