import express, { Request, Response } from 'express';
import chargeRoutes from './routes/charge.routes';
import { SERVER_CONFIG, RESPONSE_STATUS } from './constants/app.constants';

const app = express();
const PORT = process.env.PORT || SERVER_CONFIG.DEFAULT_PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: RESPONSE_STATUS.OK });
});

// Routes
app.use('/', chargeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://${SERVER_CONFIG.HOST}:${PORT}/health`);
  console.log(`Charge endpoint available at http://${SERVER_CONFIG.HOST}:${PORT}/charge`);
});

export default app; 