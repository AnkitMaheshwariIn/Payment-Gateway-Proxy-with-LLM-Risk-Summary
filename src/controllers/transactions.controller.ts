import { Request, Response } from 'express';
import { getAllTransactions } from '../transactionLog';
import { RESPONSE_STATUS } from '../constants/app.constants';

export class TransactionsController {
  public static async getAllTransactions(_req: Request, res: Response): Promise<void> {
    try {
      const transactions = getAllTransactions();
      
      res.status(200).json({
        status: RESPONSE_STATUS.OK,
        data: {
          transactions,
          count: transactions.length
        }
      });
    } catch (error) {
      res.status(500).json({
        status: RESPONSE_STATUS.ERROR,
        error: 'Failed to retrieve transactions'
      });
    }
  }
} 