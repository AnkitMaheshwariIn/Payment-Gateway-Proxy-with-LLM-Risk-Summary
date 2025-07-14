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
    fraudScore: number;
    triggeredRules: string[];
    llmExplanation: string;
  } | null;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FraudScoreResult {
  fraudScore: number;
  riskPercentage: number;
  isHighRisk: boolean;
  triggeredRules: string[];
} 