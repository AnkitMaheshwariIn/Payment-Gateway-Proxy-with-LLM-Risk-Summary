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
  ERROR: 'error'
} as const;

// Server Configuration
export const SERVER_CONFIG = {
  DEFAULT_PORT: 3000,
  HOST: 'localhost'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error'
} as const; 