import OpenAI from 'openai';
import { 
  LLM_CONFIG, 
  LLM_PROMPT_TEMPLATE 
} from '../constants/app.constants';

/**
 * Service class for generating natural language explanations using OpenAI's GPT models.
 * Provides intelligent, contextual explanations of fraud risk factors.
 */
export class LLMService {
  /** Singleton instance of OpenAI client to avoid multiple initializations */
  private static openai: OpenAI;

  /**
   * Initializes and returns the OpenAI client instance.
   * Uses singleton pattern to ensure only one instance is created.
   * 
   * @returns OpenAI client instance
   */
  private static getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID, // required for sk-proj- keys
        project: process.env.OPENAI_PROJECT_ID
      });
    }
    return this.openai;
  }

  /**
   * Generates a natural language explanation of fraud risk factors using OpenAI GPT-3.5-turbo.
   * Creates a professional, contextual explanation based on transaction details and triggered risk rules.
   * 
   * @param amount - Transaction amount in the specified currency
   * @param currency - Three-letter currency code (e.g., USD, EUR)
   * @param email - Customer email address
   * @param fraudScore - Calculated fraud score (0.0 to 1.0)
   * @param triggeredRules - Array of risk factors that were triggered during fraud analysis
   * @returns Promise<string> - Natural language explanation of the fraud risk
   * 
   * @example
   * ```typescript
   * const explanation = await LLMService.generateFraudExplanation(
   *   6000, 'GBP', 'test@example.ru', 0.9, 
   *   ['High Amount', 'Suspicious Email Domain']
   * );
   * // Returns: "Transaction flagged as high risk due to suspicious email domain and high transaction amount."
   * ```
   */
  public static async generateFraudExplanation(
    amount: number,
    currency: string,
    email: string,
    fraudScore: number,
    triggeredRules: string[]
  ): Promise<string> {
    try {
      // Get OpenAI client instance
      const openai = this.getOpenAI();
      
      // Calculate risk percentage for better readability
      const riskPercentage = Math.round(fraudScore * 100);
      
      // Build dynamic prompt by replacing placeholders in the template
      const prompt = LLM_PROMPT_TEMPLATE.FRAUD_EXPLANATION
        .replace('{amount}', amount.toString())
        .replace('{currency}', currency)
        .replace('{email}', email)
        .replace('{fraudScore}', fraudScore.toString())
        .replace('{riskPercentage}', riskPercentage.toString())
        .replace('{triggeredRules}', triggeredRules.join(', '));

      // Make API call to OpenAI with configured parameters
      const completion = await openai.chat.completions.create({
        model: LLM_CONFIG.MODEL,
        messages: [
          {
            role: "system",
            content: LLM_CONFIG.SYSTEM_PROMPT
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: LLM_CONFIG.MAX_TOKENS,
        temperature: LLM_CONFIG.TEMPERATURE
      });

      // Extract and return the generated explanation
      const generatedExplanation = completion.choices[0]?.message?.content?.trim();
      
      // Return generated explanation or fallback if API response is empty
      return generatedExplanation || this.generateFallbackExplanation(fraudScore, triggeredRules);
      
    } catch (error) {
      // Log error for debugging purposes
      console.error('Error generating fraud explanation via OpenAI API:', error);
      
      // Return fallback explanation if API call fails
      return this.generateFallbackExplanation(fraudScore, triggeredRules);
    }
  }

  /**
   * Generates a fallback explanation when OpenAI API is unavailable or fails.
   * Provides a basic but informative explanation using the available data.
   * 
   * @param fraudScore - Calculated fraud score (0.0 to 1.0)
   * @param triggeredRules - Array of risk factors that were triggered
   * @returns string - Fallback explanation
   * 
   * @private
   */
  private static generateFallbackExplanation(
    fraudScore: number, 
    triggeredRules: string[]
  ): string {
    const riskPercentage = Math.round(fraudScore * 100);
    
    if (triggeredRules.length === 0) {
      return `Transaction appears safe with ${riskPercentage}% risk score and no specific risk factors detected.`;
    }
    
    return `Transaction flagged with ${riskPercentage}% risk due to ${triggeredRules.join(', ').toLowerCase()}.`;
  }
} 