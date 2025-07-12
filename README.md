
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
└── index.ts           # Main application entry point
```

## 🚀 Features

- **POST /charge** - Payment validation endpoint with comprehensive field validation
- **GET /health** - Health check endpoint
- **Class-based Architecture** - Clean separation of concerns
- **TypeScript** - Full type safety and IntelliSense support
- **Comprehensive Testing** - Unit and integration tests
- **Validation Service** - Reusable validation logic

## API Endpoints

### GET /health
Health check endpoint that returns server status.

**Response:**
```json
{
  "status": "ok"
}
```

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

**Success Response (200):**
```json
{
  "status": "valid",
  "data": {
    "amount": 100,
    "currency": "USD",
    "source": "stripe",
    "email": "user@example.com"
  }
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

3. **Development:**
   ```bash
   npm run dev
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

### Controllers (`src/controllers/`)
- `charge.controller.ts` - HTTP request/response handling for charge operations

### Routes (`src/routes/`)
- `charge.routes.ts` - Express route definitions and controller mapping

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

## 🔒 License

This project is proprietary and confidential. Unauthorized use or distribution is strictly prohibited.
For licensing requests, contact **Ankit Maheshwari**.


