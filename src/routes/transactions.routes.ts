import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';

const router = Router();

router.get('/transactions', TransactionsController.getAllTransactions);

export default router; 