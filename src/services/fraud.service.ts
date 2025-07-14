import { ChargeRequest, FraudScoreResult } from '../interfaces/charge.interface';
import { FraudRule, FraudRulesConfig } from '../interfaces/fraud.interface';
import { FRAUD_SCORING } from '../constants/app.constants';
import { ConfigLoader } from '../utils/configLoader';
import * as fs from 'fs';
import * as path from 'path';

export class FraudService {
  private static fraudRules: FraudRule[] | null = null;

  /**
   * Loads fraud rules from the external JSON configuration file.
   * Uses singleton pattern to load rules only once and cache them.
   * 
   * @returns Promise<FraudRule[]> - Array of fraud rules
   * @throws Error if rules file cannot be loaded or parsed
   */
  private static async loadFraudRules(): Promise<FraudRule[]> {
    if (this.fraudRules) {
      return this.fraudRules;
    }

    try {
      const configPath = path.join(__dirname, '../config/fraudRules.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      const config: FraudRulesConfig = JSON.parse(configData);
      
      this.fraudRules = config.rules;
      console.log(`📋 Loaded ${this.fraudRules.length} fraud rules from configuration`);
      
      return this.fraudRules;
    } catch (error) {
      console.error('❌ Failed to load fraud rules from configuration:', error);
      throw new Error('Failed to load fraud rules configuration');
    }
  }

  /**
   * Safely evaluates a JavaScript expression in a controlled environment.
   * Creates a function with the transaction variables and evaluates the condition.
   * 
   * @param condition - JavaScript expression as string
   * @param variables - Object containing variables for the expression
   * @returns boolean - Result of the condition evaluation
   * 
   * @private
   */
  private static evaluateCondition(condition: string, variables: any): boolean {
    try {
      // Create a function with the variables as parameters
      const functionBody = `return (${condition});`;
      const evaluator = new Function(...Object.keys(variables), functionBody);
      
      // Execute the function with the provided variables
      return evaluator(...Object.values(variables));
    } catch (error) {
      console.error(`❌ Error evaluating fraud rule condition "${condition}":`, error);
      return false; // Default to false on evaluation error
    }
  }

  /**
   * Calculates fraud score by evaluating all configured fraud rules.
   * Each rule is evaluated dynamically using JavaScript expressions.
   * 
   * @param chargeData - The charge request data to evaluate
   * @returns Promise<FraudScoreResult> - Fraud scoring result with triggered rules
   * 
   * @example
   * ```typescript
   * const result = await FraudService.calculateFraudScore({
   *   amount: 6000,
   *   currency: 'GBP',
   *   source: 'stripe',
   *   email: 'test@example.ru'
   * });
   * // Returns: { fraudScore: 0.9, riskPercentage: 90, isHighRisk: true, triggeredRules: [...] }
   * ```
   */
  public static async calculateFraudScore(chargeData: ChargeRequest): Promise<FraudScoreResult> {
    try {
      // Load fraud rules from configuration
      const rules = await this.loadFraudRules();
      
      let fraudScore = 0;
      const triggeredRules: string[] = [];

      // Load risky domains for email validation
      const riskyDomains = ConfigLoader.loadRiskyDomains();
      
      // Load supported currencies for validation
      const supportedCurrencies = ConfigLoader.getActiveCurrencyCodes();
      
      // Helper function to check if email domain is risky
      const isRiskyDomain = (email: string): boolean => {
        const domain = email.toLowerCase().split('@')[1];
        return riskyDomains.some(riskyDomain => 
          domain.endsWith(riskyDomain.toLowerCase())
        );
      };

      // Helper function to check if currency is supported
      const isSupportedCurrency = (currency: string): boolean => {
        return supportedCurrencies.includes(currency.toUpperCase());
      };

      // Variables available for rule evaluation
      const variables = {
        amount: chargeData.amount,
        currency: chargeData.currency,
        source: chargeData.source,
        email: chargeData.email,
        isRiskyDomain,
        isSupportedCurrency
      };

      // Evaluate each rule
      for (const rule of rules) {
        const isTriggered = this.evaluateCondition(rule.condition, variables);
        
        if (isTriggered) {
          fraudScore += rule.score;
          triggeredRules.push(rule.label);
          console.log(`🚨 Fraud rule triggered: ${rule.label} (score: ${rule.score})`);
        }
      }

      // Calculate risk percentage (fraud score as percentage)
      const riskPercentage = Math.round(fraudScore * 100);

      // Determine if high risk
      const isHighRisk = fraudScore >= FRAUD_SCORING.HIGH_RISK_THRESHOLD;

      console.log(`📊 Fraud evaluation complete: score=${fraudScore}, risk=${riskPercentage}%, rules=${triggeredRules.length}`);

      return {
        fraudScore,
        riskPercentage,
        isHighRisk,
        triggeredRules
      };
    } catch (error) {
      console.error('❌ Error in fraud score calculation:', error);
      
      // Return safe defaults on error
      return {
        fraudScore: 0,
        riskPercentage: 0,
        isHighRisk: false,
        triggeredRules: []
      };
    }
  }

  /**
   * Reloads fraud rules from the configuration file.
   * Useful for updating rules without restarting the application.
   * 
   * @returns Promise<void>
   */
  public static async reloadRules(): Promise<void> {
    this.fraudRules = null;
    await this.loadFraudRules();
    console.log('🔄 Fraud rules reloaded from configuration');
  }

  /**
   * Gets the currently loaded fraud rules.
   * 
   * @returns Promise<FraudRule[]> - Array of currently loaded fraud rules
   */
  public static async getLoadedRules(): Promise<FraudRule[]> {
    return await this.loadFraudRules();
  }
} 