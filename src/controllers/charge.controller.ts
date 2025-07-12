import { Request, Response } from 'express';
import { ChargeRequest } from '../interfaces/charge.interface';
import { ChargeService } from '../services/charge.service';

export class ChargeController {
  public static async processCharge(req: Request, res: Response): Promise<void> {
    try {
      const chargeData: ChargeRequest = req.body;
      const result = ChargeService.processCharge(chargeData);
      
      if (result.status === 'error') {
        res.status(400).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'Internal server error'
      });
    }
  }
} 