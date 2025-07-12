import { Router } from 'express';
import { ChargeController } from '../controllers/charge.controller';

const router = Router();

router.post('/charge', ChargeController.processCharge);

export default router; 