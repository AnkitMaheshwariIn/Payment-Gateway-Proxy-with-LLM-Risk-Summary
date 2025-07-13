
# Payment Gateway Proxy with LLM Risk Summary

A Node.js + TypeScript payment gateway proxy service with comprehensive validation and class-based architecture.

## Architecture

This project follows a clean, class-based architecture with proper separation of concerns:

```
src/
├── interfaces/          # TypeScript interfaces and type definitions
├── services/           # Business logic and validation services
├── controllers/        # HTTP request/response handlers
├── routes/            # Express route definitions
├── constants/          # Application constants and configuration
└── index.ts           # Main application entry point
```

## 🚀 Features

- **POST /charge** - Payment validation endpoint with comprehensive field validation
- **GET /health** - Health check endpoint
- **GET /transactions** - Retrieve all stored transactions with audit trail
- **Class-based Architecture** - Clean separation of concerns
- **TypeScript** - Full type safety and IntelliSense support
- **Comprehensive Testing** - Unit and integration tests
- **Validation Service** - Reusable validation logic
- **In-Memory Transaction Logging** - Logged each charge with transactionId and timestamp

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
        "fraudScore": 0.3,
        "decision": "approved",
        "llmExplanation": "Transaction flagged as medium risk due to high transaction amount."
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

### POST /charge
Validates payment charge data with comprehensive field validation.

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
The system calculates a fraud score based on risk factors:
- **High Amount**: +0.3 points if amount > $5,000
- **Risky Domain**: +0.4 points if email ends with .ru or .xyz
- **Non-Standard Currency**: +0.2 points if currency is not USD, EUR, or INR

**Risk Assessment:**
- **Low Risk** (score < 0.5): Returns 200 with "safe" status
- **High Risk** (score ≥ 0.5): Returns 403 with "High risk" error
- **Risk Percentage**: Calculated as (fraudScore × 100)%
- **LLM Explanation**: Natural language explanation of risk factors using OpenAI GPT-3.5-turbo

**LLM Configuration:**
- **Model**: GPT-3.5-turbo for optimal performance and cost
- **Max Tokens**: 150 for concise explanations
- **Temperature**: 0.3 for consistent, professional output
- **System Prompt**: Fraud detection expert persona
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
  "status": "safe",
  "data": {
    "amount": 100,
    "currency": "USD",
    "source": "stripe",
    "email": "user@example.com"
  },
  "fraudScore": 0.3,
  "riskPercentage": 30,
  "explanation": "Transaction flagged as medium risk due to high transaction amount."
}
```

**High Risk Response (403):**
```json
{
  "status": "error",
  "error": "High risk",
  "fraudScore": 0.7,
  "riskPercentage": 70,
  "explanation": "Transaction flagged as high risk due to suspicious email domain and unsupported currency."
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "error": "Clear error message describing the validation failure"
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

3. **Development:**
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
   💳 Charge endpoint available at http://localhost:3000/charge
   📊 Transactions endpoint available at http://localhost:3000/transactions
   🎉 All services are healthy! Server is ready to handle requests.
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Start production server:**
   ```bash
   npm start
   ```

6. **Run tests:**
   ```bash
   npm test
   ```

## Project Structure

### Interfaces (`src/interfaces/`)
- `charge.interface.ts` - Type definitions for charge requests, responses, and validation results

### Services (`src/services/`)
- `validation.service.ts` - Static class containing all validation logic
- `charge.service.ts` - Static class containing business logic for charge processing
- `fraud.service.ts` - Static class containing fraud detection and scoring logic
- `llm.service.ts` - Static class containing OpenAI integration for natural language explanations
- `health.service.ts` - Static class containing health checks and dependency validation

### Controllers (`src/controllers/`)
- `charge.controller.ts` - HTTP request/response handling for charge operations

### Routes (`src/routes/`)
- `charge.routes.ts` - Express route definitions and controller mapping

### Constants (`src/constants/`)
- `app.constants.ts` - Application constants (payment sources, validation rules, server config, response status, LLM configuration)

### Transaction Logging (`src/`)
- `transactionLog.ts` - In-memory transaction logging with UUID generation and timestamp tracking

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Individual service and validation logic testing
- **Integration Tests**: End-to-end API endpoint testing
- **Test Coverage**: Validation of all success and error scenarios

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

## 🚀 Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

3. Test the charge endpoint:
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

4. View all transactions:
   ```bash
   curl http://localhost:3000/transactions
   ```

## 🔒 License

This project is proprietary and confidential. Unauthorized use or distribution is strictly prohibited.
For licensing requests, contact **Ankit Maheshwari**.


