export interface FraudRule {
  label: string;
  condition: string;
  score: number;
}

export interface FraudRulesConfig {
  rules: FraudRule[];
}

export interface FraudEvaluationResult {
  fraudScore: number;
  triggeredRules: string[];
  riskPercentage: number;
} 