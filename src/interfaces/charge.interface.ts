export interface ChargeRequest {
  amount: number;
  currency: string;
  source: string;
  email: string;
}

export interface ChargeResponse {
  status: string;
  data?: ChargeRequest;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
} 