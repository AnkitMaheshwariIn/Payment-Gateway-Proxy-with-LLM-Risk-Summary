
# Payment Gateway Proxy with LLM Risk Summary

A Node.js + TypeScript payment gateway proxy service with comprehensive fraud detection, LLM-powered risk analysis, and class-based architecture.

## Architecture

This project follows a clean, class-based architecture with proper separation of concerns:

```
src/
├── interfaces/          # TypeScript interfaces and type definitions
├── services/           # Business logic and validation services
├── controllers/        # HTTP request/response handlers
├── routes/            # Express route definitions
├── constants/          # Application constants and configuration
├── config/            # JSON configuration files for fraud rules, currencies, etc.
├── utils/             # Utility functions and Swagger documentation
└── index.ts           # Main application entry point
```

## 🚀 Features

- **POST /charge** - Payment processing with fraud detection and LLM risk analysis
- **GET /health** - Health check endpoint
- **GET /transactions** - Retrieve all stored transactions with audit trail
- **DELETE /cache/clear** - Clear LLM explanation cache
- **GET /cache/stats** - Get cache statistics
- **GET /docs** - Interactive API documentation (Swagger UI)
- **Class-based Architecture** - Clean separation of concerns
- **TypeScript** - Full type safety and IntelliSense support
- **Comprehensive Testing** - Unit and integration tests with 80+ test cases
- **Fraud Detection** - Configurable fraud rules with risk scoring
- **LLM Integration** - OpenAI GPT-3.5-turbo for natural language risk explanations
- **In-Memory Transaction Logging** - Complete audit trail with transactionId and timestamps
- **Cache Management** - In-memory caching for LLM explanations to reduce API calls

## ⚙️ Configuration Files

The application uses JSON configuration files for easy maintenance and updates without code changes:

### Fraud Rules (`src/config/fraudRules.json`)
- Fraud detection heuristics are defined in `src/config/fraudRules.json`
- Each rule contains:
  - `label`: Human-readable description
  - `condition`: JavaScript expression as a string (evaluated at runtime)
  - `score`: Numeric value added to fraud score if rule triggers (0.0 to 1.0)
- Rules are loaded and evaluated dynamically for each charge
- Easily maintain and update risk logic by editing the JSON file—no code changes required

### Risky Domains (`src/config/riskyDomains.json`)
- List of email domains considered risky for fraud detection
- Contains domains like `.ru`, `.xyz`, `temp.com`, etc.
- Used for email-based risk assessment
- Easily update the list without code changes

### Supported Currencies (`src/config/currencies.json`)
- Comprehensive list of supported payment currencies
- Each currency includes:
  - `code`: 3-letter currency code (e.g., "USD")
  - `name`: Full currency name (e.g., "US Dollar")
  - `symbol`: Currency symbol (e.g., "$")
  - `isActive`: Whether the currency is currently supported
- Used for currency validation and risk assessment
- Add or remove currencies by updating the JSON file

### Configuration Loading
- All config files are automatically copied to `dist/config/` during build
- ConfigLoader utility provides caching and error handling
- Supports both development (src/config) and production (dist/config) paths

## API Endpoints

### GET /health
Health check endpoint that returns server status.

**Response:**
```json
{
  "status": "ok"
}
```

### GET /transactions
Returns all stored transactions from the in-memory transaction log.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "transactions": [
      {
        "transactionId": "uuid-string",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "amount": 100,
        "currency": "USD",
        "source": "stripe",
        "email": "user@example.com",
        "riskScore": 0.3,
        "decision": "approved",
        "explanation": "Transaction flagged as medium risk due to high transaction amount."
      }
    ],
    "count": 1
  }
}
```

**Features:**
- Returns all transactions stored in memory
- Includes transaction count for easy pagination planning
- Each transaction contains complete audit trail data
- Transactions are returned in chronological order (oldest first)

### DELETE /cache/clear
Clears the in-memory cache of LLM-generated fraud explanations.

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "data": {
    "previousCacheSize": 15,
    "currentCacheSize": 0
  }
}
```

### GET /cache/stats
Returns current statistics about the LLM explanation cache.

**Response:**
```json
{
  "success": true,
  "message": "Cache statistics retrieved successfully",
  "data": {
    "cacheSize": 23,
    "cacheStatus": "active"
  }
}
```

### GET /docs
Interactive API documentation powered by Swagger UI.
- Complete API reference with examples
- Try out endpoints directly from the browser
- Detailed request/response schemas
- Available at `http://localhost:3000/docs`

### POST /charge
Processes payment charge data with comprehensive fraud detection and LLM risk analysis.

**Request Body:**
```json
{
  "amount": 100,
  "currency": "USD",
  "source": "stripe",
  "email": "user@example.com"
}
```

**Validation Rules:**
- `amount`: Must be a positive number (> 0)
- `currency`: Must be a 3-letter uppercase string (e.g., "USD", "EUR")
- `source`: Must be either "stripe" or "paypal"
- `email`: Must be a valid email format

**Fraud Scoring:**
The system calculates a fraud score (0.0 to 1.0) based on configurable risk factors:
- **High Amount**: +0.3 points if amount > $5,000
- **Very High Amount**: +0.5 points if amount > $10,000 (mutually exclusive with High Amount)
- **Risky Domain**: +0.4 points if email ends with .ru or .xyz
- **Non-Standard Currency**: +0.2 points if currency is not USD, EUR, or INR
- **Suspicious Email Pattern**: +0.1 points for test/temp emails
- **Non-Standard Payment Source**: +0.3 points for non-standard sources

**Risk Assessment:**
- **Low Risk** (score < 0.5): Returns 200 with "safe" status
- **High Risk** (score ≥ 0.5): Returns 403 with "declined" status
- **LLM Explanation**: Natural language explanation of risk factors using OpenAI GPT-3.5-turbo

**LLM Configuration:**
- **Model**: GPT-3.5-turbo for optimal performance and cost
- **Max Tokens**: 150 for concise explanations
- **Temperature**: 0.3 for consistent, professional output
- **System Prompt**: Fraud detection expert persona
- **Caching**: In-memory cache to avoid redundant API calls
- **Fallback**: Automatic fallback explanations if API unavailable

**Health Checks:**
- **Startup Validation**: Tests OpenAI API connection on server startup
- **Environment Validation**: Verifies required environment variables
- **API Connectivity**: Validates network connectivity and API key
- **Graceful Degradation**: Server starts even if some services are unhealthy

**🧾 In-Memory Transaction Logging:**
- **Automatic Logging**: Each charge request is automatically logged with unique transactionId
- **Complete Data**: Stores amount, email, currency, source, fraud score, decision, and LLM explanation
- **Timestamp Tracking**: ISO format timestamps for audit trail
- **In-Memory Storage**: Simple array-based storage (no external database required)
- **Decision Tracking**: Records whether transaction was "approved" or "blocked" based on fraud score

**Success Response (200):**
```json
{
  "success": true,
  "message": "Charge processed successfully",
  "data": {
    "transactionId": "uuid-string",
    "amount": 100,
    "currency": "USD",
    "status": "safe",
    "riskScore": 0.3,
    "triggeredRules": ["high_amount"],
    "explanation": "Transaction flagged as medium risk due to high transaction amount."
  }
}
```

**High Risk Response (403):**
```json
{
  "success": false,
  "message": "Charge declined due to high fraud risk",
  "data": {
    "transactionId": "uuid-string",
    "amount": 6000,
    "currency": "USD",
    "status": "declined",
    "riskScore": 0.7,
    "triggeredRules": ["high_amount", "suspicious_email"],
    "explanation": "Transaction flagged as high risk due to suspicious email domain and high amount."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Clear error message describing the validation failure",
  "data": null
}
```

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Payment-Gateway-Proxy-with-LLM-Risk-Summary
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file
   cat > .env << EOF
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Server Configuration (optional - defaults to 3000)
   PORT=3000
   EOF
   ```
   
   **Required Environment Variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key for LLM explanations
   
   **Optional Environment Variables:**
   - `PORT`: Server port (defaults to 3000)

4. **Development:**
   ```bash
   npm run dev
   ```
   
   The server will perform health checks on startup and display the results:
   ```
   🚀 Starting Payment Gateway Proxy Server...
   🔍 Performing health checks...
   
   🔍 Health Check Results:
   ==================================================
   ✅ OpenAI API: HEALTHY
      Successfully connected to OpenAI API (gpt-3.5-turbo)
   ==================================================
   ✅ Overall Status: HEALTHY
   ⏰ Timestamp: 2024-01-01T00:00:00.000Z
   
   ✅ Server is running on port 3000
   🔗 Health check available at http://localhost:3000/health
   📚 API Documentation available at http://localhost:3000/docs
   💳 Charge endpoint available at http://localhost:3000/charge
   📊 Transactions endpoint available at http://localhost:3000/transactions
   🗑️  Cache management available at http://localhost:3000/cache/stats
   🎉 All services are healthy! Server is ready to handle requests.
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Start production server:**
   ```bash
   npm start
   ```

7. **Run tests:**
   ```bash
   npm test
   ```

## Project Structure

### Interfaces (`src/interfaces/`)
- `charge.interface.ts` - Type definitions for charge requests, responses, and validation results
- `fraud.interface.ts` - Type definitions for fraud rules and scoring

### Services (`src/services/`)
- `validation.service.ts` - Static class containing all validation logic
- `charge.service.ts` - Static class containing business logic for charge processing
- `fraud.service.ts` - Static class containing fraud detection and scoring logic
- `llm.service.ts` - Static class containing OpenAI integration for natural language explanations
- `health.service.ts` - Static class containing health checks and dependency validation

### Controllers (`src/controllers/`)
- `charge.controller.ts` - HTTP request/response handling for charge operations
- `transactions.controller.ts` - HTTP request/response handling for transaction retrieval
- `cache.controller.ts` - HTTP request/response handling for cache management

### Routes (`src/routes/`)
- `charge.routes.ts` - Express route definitions for charge operations with Swagger documentation
- `transactions.routes.ts` - Express route definitions for transaction retrieval
- `cache.routes.ts` - Express route definitions for cache management

### Constants (`src/constants/`)
- `app.constants.ts` - Application constants (payment sources, validation rules, server config, response status, LLM configuration)

### Utils (`src/utils/`)
- `swagger.ts` - Swagger/OpenAPI documentation configuration
- `configLoader.ts` - Utility for loading and caching JSON configuration files

### Transaction Logging (`src/`)
- `transactionLog.ts` - In-memory transaction logging with UUID generation and timestamp tracking

## Testing

The project includes comprehensive testing with **80+ test cases**:

- **Unit Tests**: Individual service and validation logic testing
- **Integration Tests**: End-to-end API endpoint testing
- **Test Coverage**: Validation of all success and error scenarios
- **Fraud Detection Tests**: Comprehensive testing of fraud scoring logic
- **LLM Service Tests**: Testing of OpenAI integration and caching
- **Cache Management Tests**: Testing of cache clearing and statistics

Run tests with:
```bash
npm test
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite

## Architecture Benefits

- **Separation of Concerns**: Each class has a single responsibility
- **Testability**: Services can be unit tested independently
- **Maintainability**: Easy to modify individual components
- **Scalability**: Easy to add new features and services
- **Type Safety**: Full TypeScript support with interfaces
- **Reusability**: Services can be reused across different controllers
- **Configuration-Driven**: Fraud rules and settings in JSON files
- **API Documentation**: Auto-generated Swagger documentation

## 🚀 Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```

2. View API documentation:
   ```bash
   open http://localhost:3000/docs
   ```

3. Test the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

4. Test the charge endpoint:
   ```bash
   curl -X POST http://localhost:3000/charge \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 100,
       "currency": "USD",
       "source": "stripe",
       "email": "test@example.com"
     }'
   ```

5. View all transactions:
   ```bash
   curl http://localhost:3000/transactions
   ```

6. Check cache statistics:
   ```bash
   curl http://localhost:3000/cache/stats
   ```

## 🔒 License

This project is proprietary and confidential. Unauthorized use or distribution is strictly prohibited.
For licensing requests, contact **Ankit Maheshwari**.


