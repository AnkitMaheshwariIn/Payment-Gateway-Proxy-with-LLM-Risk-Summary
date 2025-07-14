import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import chargeRoutes from './routes/charge.routes';
import transactionsRoutes from './routes/transactions.routes';
import cacheRoutes from './routes/cache.routes';
import { SERVER_CONFIG, RESPONSE_STATUS } from './constants/app.constants';
import { HealthService } from './services/health.service';
import { swaggerSpec } from './utils/swagger';

const app = express();
const PORT = process.env.PORT || SERVER_CONFIG.DEFAULT_PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Payment Gateway Proxy API Documentation'
}));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: RESPONSE_STATUS.OK });
});

// Routes
app.use('/', chargeRoutes);
app.use('/', transactionsRoutes);
app.use('/', cacheRoutes);

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
      console.log(`📚 API Documentation available at http://${SERVER_CONFIG.HOST}:${PORT}/docs`);
      console.log(`💳 Charge endpoint available at http://${SERVER_CONFIG.HOST}:${PORT}/charge`);
      console.log(`📊 Transactions endpoint available at http://${SERVER_CONFIG.HOST}:${PORT}/transactions`);
      console.log(`🗑️  Cache management available at http://${SERVER_CONFIG.HOST}:${PORT}/cache/stats`);
      
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

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initializeServer();
}

export default app;
export { initializeServer }; 