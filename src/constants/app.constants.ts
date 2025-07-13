// Payment Sources
export const PAYMENT_SOURCES = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal'
} as const;

export const VALID_PAYMENT_SOURCES = Object.values(PAYMENT_SOURCES);

// Validation Formats
export const CURRENCY_FORMAT = {
  PATTERN: /^[A-Z]{3}$/,
  DESCRIPTION: '3-letter uppercase string (e.g., \'USD\')'
} as const;

export const EMAIL_FORMAT = {
  PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DESCRIPTION: 'valid email format'
} as const;

export const AMOUNT_VALIDATION = {
  MIN_VALUE: 0,
  DESCRIPTION: 'positive number'
} as const;

// Response Status Values
export const RESPONSE_STATUS = {
  OK: 'ok',
  VALID: 'valid',
  ERROR: 'error',
  SAFE: 'safe'
} as const;

// Server Configuration
export const SERVER_CONFIG = {
  DEFAULT_PORT: 3000,
  HOST: 'localhost'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  HIGH_RISK: 'High risk'
} as const;

// Fraud Detection Constants
export const FRAUD_SCORING = {
  HIGH_AMOUNT_THRESHOLD: 5000,
  HIGH_AMOUNT_SCORE: 0.3,
  RISKY_DOMAIN_SCORE: 0.4,
  NON_STANDARD_CURRENCY_SCORE: 0.2,
  HIGH_RISK_THRESHOLD: 0.5
} as const;

export const RISKY_DOMAINS = ['.ru', '.xyz', 'fraud.nett', 'fraud.comm'] as const;

export const STANDARD_CURRENCIES = ['USD', 'EUR', 'INR'] as const;

// LLM Configuration Constants
export const LLM_CONFIG = {
  MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 150,
  TEMPERATURE: 0.3,
  SYSTEM_PROMPT: 'You are a fraud detection expert. Provide clear, concise explanations of fraud risk factors in a professional tone.'
} as const;

export const LLM_PROMPT_TEMPLATE = {
  FRAUD_EXPLANATION: `Given the following transaction details and fraud analysis, provide a concise, professional explanation of the fraud risk:

Transaction Details:
- Amount: {amount} {currency}
- Email: {email}
- Fraud Score: {fraudScore} ({riskPercentage}% risk)
- Triggered Risk Factors: {triggeredRules}

Please provide a brief, natural language explanation (1-2 sentences) explaining why this transaction was flagged and what risk factors contributed to the score. Focus on being clear and professional.

Example format: "Transaction flagged as [risk level] due to [specific factors]."`
} as const; 