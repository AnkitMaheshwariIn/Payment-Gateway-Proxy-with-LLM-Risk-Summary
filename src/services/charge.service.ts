import { ChargeRequest, ChargeResponse } from '../interfaces/charge.interface';
import { ValidationService } from './validation.service';
import { FraudService } from './fraud.service';
import { LLMService } from './llm.service';
import { logTransaction } from '../transactionLog';

export class ChargeService {
  public static async processCharge(chargeData: ChargeRequest): Promise<ChargeResponse> {
    try {
      // Validate amount
      const amountValidation = ValidationService.validateAmount(chargeData.amount);
      if (!amountValidation.isValid) {
        return {
          success: false,
          message: amountValidation.error || 'Invalid amount',
          data: null
        };
      }

      // Validate currency
      const currencyValidation = ValidationService.validateCurrency(chargeData.currency);
      if (!currencyValidation.isValid) {
        return {
          success: false,
          message: currencyValidation.error || 'Invalid currency',
          data: null
        };
      }

      // Validate source
      const sourceValidation = ValidationService.validateSource(chargeData.source);
      if (!sourceValidation.isValid) {
        return {
          success: false,
          message: sourceValidation.error || 'Invalid source',
          data: null
        };
      }

      // Validate email
      const emailValidation = ValidationService.validateEmail(chargeData.email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          message: emailValidation.error || 'Invalid email',
          data: null
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

      // Log the transaction and get the transactionId
      const transaction = logTransaction({
        amount: chargeData.amount,
        currency: chargeData.currency,
        source: chargeData.source,
        email: chargeData.email,
        fraudScore: fraudResult.fraudScore,
        decision,
        llmExplanation: explanation
      });
      const transactionId = transaction.transactionId;

      // Build the data object for the response
      const data = {
        transactionId,
        amount: chargeData.amount,
        currency: chargeData.currency,
        status: decision === 'blocked' ? 'declined' : 'safe',
        fraudScore: Math.round(fraudResult.fraudScore * 100),
        triggeredRules: fraudResult.triggeredRules,
        llmExplanation: explanation
      };

      // Check if transaction is high risk
      if (fraudResult.isHighRisk) {
        return {
          success: false,
          message: 'Charge declined due to high fraud risk',
          data
        };
      }

      // If all validations pass, return success with fraud score and explanation
      return {
        success: true,
        message: 'Charge processed successfully',
        data
      };
    } catch (error) {
      console.error('❌ Error processing charge:', error);
      return {
        success: false,
        message: 'Internal server error',
        data: null
      };
    }
  }
} 