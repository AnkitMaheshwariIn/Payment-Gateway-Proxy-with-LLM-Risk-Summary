import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import express, { Request, Response } from 'express';
import chargeRoutes from './routes/charge.routes';
import { SERVER_CONFIG, RESPONSE_STATUS } from './constants/app.constants';
import { HealthService } from './services/health.service';

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

/**
 * Initialize server with health checks
 */
async function initializeServer(): Promise<void> {
  try {
    console.log('🚀 Starting Payment Gateway Proxy Server...');
    console.log('🔍 Performing health checks...');
    
    // Perform health checks before starting server
    const healthStatus = await HealthService.performHealthChecks();
    HealthService.logHealthStatus(healthStatus);
    
    // Start server regardless of health status, but warn if unhealthy
    if (healthStatus.overall === 'unhealthy') {
      console.log('⚠️  Warning: Some services are unhealthy. Server will start but some features may not work properly.');
      console.log('💡 Please check your environment variables and network connectivity.');
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🔗 Health check available at http://${SERVER_CONFIG.HOST}:${PORT}/health`);
      console.log(`💳 Charge endpoint available at http://${SERVER_CONFIG.HOST}:${PORT}/charge`);
      
      if (healthStatus.overall === 'healthy') {
        console.log('🎉 All services are healthy! Server is ready to handle requests.');
      } else {
        console.log('⚠️  Server started with some unhealthy services. Check logs above for details.');
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
}

// Initialize server
initializeServer();

export default app; 