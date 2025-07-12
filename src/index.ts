import express, { Request, Response } from 'express';
import chargeRoutes from './routes/charge.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Routes
app.use('/', chargeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Charge endpoint available at http://localhost:${PORT}/charge`);
});

export default app; 