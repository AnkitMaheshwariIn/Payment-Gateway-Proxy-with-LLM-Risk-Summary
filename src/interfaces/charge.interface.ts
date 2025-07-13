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
  fraudScore?: number;
  riskPercentage?: number;
  explanation?: string;
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