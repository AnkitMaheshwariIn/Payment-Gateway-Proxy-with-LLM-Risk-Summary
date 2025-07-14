import { ChargeRequest, ChargeResponse } from '../interfaces/charge.interface';
import { ValidationService } from './validation.service';
import { FraudService } from './fraud.service';
import { LLMService } from './llm.service';
import { RESPONSE_STATUS } from '../constants/app.constants';
import { logTransaction } from '../transactionLog';

export class ChargeService {
  public static async processCharge(chargeData: ChargeRequest): Promise<ChargeResponse> {
    try {
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

      // Calculate fraud score (now async)
      const fraudResult = await FraudService.calculateFraudScore(chargeData);

      // Generate LLM explanation
      const explanation = await LLMService.generateFraudExplanation(
        chargeData.amount,
        chargeData.currency,
        chargeData.email,
        fraudResult.fraudScore,
        fraudResult.triggeredRules
      );

      // Determine decision based on fraud score
      const decision = fraudResult.fraudScore >= 0.5 ? 'blocked' : 'approved';

      // Log the transaction
      logTransaction({
        amount: chargeData.amount,
        currency: chargeData.currency,
        source: chargeData.source,
        email: chargeData.email,
        fraudScore: fraudResult.fraudScore,
        decision,
        llmExplanation: explanation
      });

      // Check if transaction is high risk
      if (fraudResult.isHighRisk) {
        return {
          status: RESPONSE_STATUS.ERROR,
          error: 'High risk',
          fraudScore: fraudResult.fraudScore,
          riskPercentage: fraudResult.riskPercentage,
          explanation
        };
      }

      // If all validations pass, return success with fraud score and explanation
      return {
        status: RESPONSE_STATUS.SAFE,
        data: chargeData,
        fraudScore: fraudResult.fraudScore,
        riskPercentage: fraudResult.riskPercentage,
        explanation
      };
    } catch (error) {
      console.error('❌ Error processing charge:', error);
      return {
        status: RESPONSE_STATUS.ERROR,
        error: 'Internal server error'
      };
    }
  }
} 