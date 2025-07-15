import { Router } from 'express';
import { ChargeController } from '../controllers/charge.controller';

const router = Router();

/**
 * @swagger
 * /charge:
 *   post:
 *     summary: Process a payment charge with fraud detection
 *     description: |
 *       Processes a payment charge with comprehensive fraud detection using configurable rules
 *       and LLM-powered risk analysis. The system evaluates the transaction against multiple
 *       fraud indicators and provides a natural language explanation of the assessment.
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChargeRequest'
 *           examples:
 *             valid_transaction:
 *               summary: Valid transaction
 *               value:
 *                 amount: 99.99
 *                 currency: "USD"
 *                 source: "tok_visa"
 *                 email: "customer@example.com"
 *             high_amount:
 *               summary: High amount transaction
 *               value:
 *                 amount: 5000.00
 *                 currency: "USD"
 *                 source: "tok_visa"
 *                 email: "customer@example.com"
 *             suspicious_email:
 *               summary: Suspicious email pattern
 *               value:
 *                 amount: 150.00
 *                 currency: "EUR"
 *                 source: "tok_mastercard"
 *                 email: "test123@temp.com"
 *     responses:
 *       200:
 *         description: Charge processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeResponse'
 *             examples:
 *               safe_transaction:
 *                 summary: Safe transaction approved
 *                 value:
 *                   success: true
 *                   message: "Charge processed successfully"
 *                   data:
 *                     transactionId: "txn_123456789"
 *                     amount: 99.99
 *                     currency: "USD"
 *                     status: "safe"
 *                     riskScore: 0.15
 *                     triggeredRules: []
 *                     explanation: "This transaction appears safe with no significant risk factors."
 *               declined_transaction:
 *                 summary: High-risk transaction declined
 *                 value:
 *                   success: false
 *                   message: "Charge declined due to high fraud risk"
 *                   data:
 *                     transactionId: "txn_987654321"
 *                     amount: 5000.00
 *                     currency: "USD"
 *                     status: "declined"
 *                     riskScore: 0.85
 *                     triggeredRules: ["high_amount", "suspicious_email"]
 *                     explanation: "This transaction shows multiple high-risk indicators and should be declined."
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors: ["Amount must be a positive number", "Invalid email format"]
 *       403:
 *         description: Transaction declined due to fraud risk
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargeResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/charge', ChargeController.processCharge);

export default router; 