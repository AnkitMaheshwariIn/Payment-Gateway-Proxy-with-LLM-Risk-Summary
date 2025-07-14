import { Request, Response } from 'express';
import { ChargeRequest } from '../interfaces/charge.interface';
import { ChargeService } from '../services/charge.service';
import { RESPONSE_STATUS, ERROR_MESSAGES } from '../constants/app.constants';

export class ChargeController {
  public static async processCharge(req: Request, res: Response): Promise<void> {
    try {
      const chargeData: ChargeRequest = req.body;
      const result = await ChargeService.processCharge(chargeData);
      
      if (!result.success) {
        // Check if it's a high risk error (which should return 403)
        if (result.message === 'Charge declined due to high fraud risk') {
          res.status(403).json(result);
        } else {
          res.status(400).json(result);
        }
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      res.status(500).json({
        status: RESPONSE_STATUS.ERROR,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      });
    }
  }
} 