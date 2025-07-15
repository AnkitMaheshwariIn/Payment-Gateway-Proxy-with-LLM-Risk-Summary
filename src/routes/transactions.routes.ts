import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';

const router = Router();

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Retrieve all processed transactions
 *     description: |
 *       Returns a list of all transactions that have been processed by the payment gateway,
 *       including their fraud scores, decisions, and LLM explanations. This endpoint is useful
 *       for monitoring, auditing, and analyzing transaction patterns.
 *     tags:
 *       - Transactions
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transactions retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *             examples:
 *               transactions_list:
 *                 summary: List of transactions
 *                 value:
 *                   success: true
 *                   message: "Transactions retrieved successfully"
 *                   data:
 *                     - id: "txn_123456789"
 *                       timestamp: "2024-01-15T10:30:00.000Z"
 *                       amount: 99.99
 *                       currency: "USD"
 *                       source: "tok_visa"
 *                       email: "customer@example.com"
 *                       riskScore: 15.5
 *                       decision: "safe"
 *                       explanation: "This transaction appears safe with moderate risk factors."
 *                     - id: "txn_987654321"
 *                       timestamp: "2024-01-15T11:45:00.000Z"
 *                       amount: 5000.00
 *                       currency: "USD"
 *                       source: "tok_visa"
 *                       email: "test123@temp.com"
 *                       riskScore: 85.2
 *                       decision: "declined"
 *                       explanation: "This transaction shows multiple high-risk indicators and should be declined."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/transactions', TransactionsController.getAllTransactions);

export default router; 