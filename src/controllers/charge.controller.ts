import { Request, Response } from 'express';
import { ChargeRequest } from '../interfaces/charge.interface';
import { ChargeService } from '../services/charge.service';
import { FraudService } from '../services/fraud.service';
import { LLMService } from '../services/llm.service';
import { RESPONSE_STATUS, ERROR_MESSAGES } from '../constants/app.constants';

export class ChargeController {
  public static async processCharge(req: Request, res: Response): Promise<void> {
    try {
      const chargeData: ChargeRequest = req.body;
      const result = await ChargeService.processCharge(chargeData);
      
      if (result.status === RESPONSE_STATUS.ERROR) {
        res.status(400).json(result);
      } else {
        // Check fraud score for high risk
        const fraudResult = FraudService.calculateFraudScore(chargeData);
        
        if (fraudResult.isHighRisk) {
          // Generate LLM explanation for high-risk transaction
          const explanation = await LLMService.generateFraudExplanation(
            chargeData.amount,
            chargeData.currency,
            chargeData.email,
            fraudResult.fraudScore,
            fraudResult.triggeredRules
          );
          
          res.status(403).json({
            status: RESPONSE_STATUS.ERROR,
            error: ERROR_MESSAGES.HIGH_RISK,
            fraudScore: fraudResult.fraudScore,
            riskPercentage: fraudResult.riskPercentage,
            explanation
          });
        } else {
          res.status(200).json({
            status: RESPONSE_STATUS.SAFE,
            data: chargeData,
            fraudScore: fraudResult.fraudScore,
            riskPercentage: fraudResult.riskPercentage,
            explanation: result.explanation
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        status: RESPONSE_STATUS.ERROR,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      });
    }
  }
} 