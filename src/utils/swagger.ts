import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Gateway Proxy API',
      version: '1.0.0',
      description: 'A payment gateway proxy with LLM-powered fraud detection and risk analysis',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        ChargeRequest: {
          type: 'object',
          required: ['amount', 'currency', 'source', 'email'],
          properties: {
            amount: {
              type: 'number',
              description: 'Payment amount (must be positive)',
              example: 99.99
            },
            currency: {
              type: 'string',
              description: 'Currency code (3 letters)',
              example: 'USD'
            },
            source: {
              type: 'string',
              description: 'Payment source identifier',
              example: 'tok_visa'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address',
              example: 'customer@example.com'
            }
          }
        },
        ChargeResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the charge was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              nullable: true,
              properties: {
                transactionId: {
                  type: 'string',
                  description: 'Unique transaction identifier'
                },
                amount: {
                  type: 'number',
                  description: 'Charged amount'
                },
                currency: {
                  type: 'string',
                  description: 'Currency code'
                },
                status: {
                  type: 'string',
                  description: 'Transaction status (safe, declined)'
                },
                fraudScore: {
                  type: 'number',
                  description: 'Calculated fraud risk score (0-100)'
                },
                triggeredRules: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'List of triggered fraud rules'
                },
                llmExplanation: {
                  type: 'string',
                  description: 'Natural language explanation of the fraud assessment'
                }
              }
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique transaction identifier'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction timestamp'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount'
            },
            currency: {
              type: 'string',
              description: 'Currency code'
            },
            source: {
              type: 'string',
              description: 'Payment source'
            },
            email: {
              type: 'string',
              description: 'Customer email'
            },
            fraudScore: {
              type: 'number',
              description: 'Fraud risk score'
            },
            decision: {
              type: 'string',
              description: 'Transaction decision'
            },
            llmExplanation: {
              type: 'string',
              description: 'LLM explanation of the decision'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Validation errors'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'] // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 