import { ChargeRequest, FraudScoreResult } from '../interfaces/charge.interface';
import { 
  FRAUD_SCORING, 
  RISKY_DOMAINS, 
  STANDARD_CURRENCIES 
} from '../constants/app.constants';

export class FraudService {
  public static calculateFraudScore(chargeData: ChargeRequest): FraudScoreResult {
    let fraudScore = 0;
    const triggeredRules: string[] = [];

    // Check for high amount
    if (chargeData.amount > FRAUD_SCORING.HIGH_AMOUNT_THRESHOLD) {
      fraudScore += FRAUD_SCORING.HIGH_AMOUNT_SCORE;
      triggeredRules.push('High Amount');
    }

    // Check for risky email domain
    const emailDomain = chargeData.email.split('@')[1]?.toLowerCase() || '';
    const hasRiskyDomain = RISKY_DOMAINS.some(domain => 
      emailDomain.endsWith(domain)
    );
    if (hasRiskyDomain) {
      fraudScore += FRAUD_SCORING.RISKY_DOMAIN_SCORE;
      triggeredRules.push('Suspicious Email Domain');
    }

    // Check for non-standard currency
    if (!STANDARD_CURRENCIES.includes(chargeData.currency as any)) {
      fraudScore += FRAUD_SCORING.NON_STANDARD_CURRENCY_SCORE;
      triggeredRules.push('Unsupported Currency');
    }

    // Calculate risk percentage (fraud score as percentage)
    const riskPercentage = Math.round(fraudScore * 100);

    // Determine if high risk
    const isHighRisk = fraudScore >= FRAUD_SCORING.HIGH_RISK_THRESHOLD;

    return {
      fraudScore,
      riskPercentage,
      isHighRisk,
      triggeredRules
    };
  }
} 