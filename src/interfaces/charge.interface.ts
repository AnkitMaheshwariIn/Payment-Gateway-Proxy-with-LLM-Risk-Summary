export interface ChargeRequest {
  amount: number;
  currency: string;
  source: string;
  email: string;
}

export interface ChargeResponse {
  success: boolean;
  message: string;
  data: {
    transactionId: string;
    amount: number;
    currency: string;
    status: string;
    riskScore: number;
    triggeredRules: string[];
    explanation: string;
  } | null;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface RiskScoreResult {
  riskScore: number;
  riskPercentage: number;
  isHighRisk: boolean;
  triggeredRules: string[];
} 