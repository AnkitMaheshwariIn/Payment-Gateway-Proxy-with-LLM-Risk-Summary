import OpenAI from 'openai';
import { 
  LLM_CONFIG, 
  LLM_PROMPT_TEMPLATE 
} from '../constants/app.constants';

/**
 * Service class for generating natural language explanations using OpenAI's GPT models.
 * Provides intelligent, contextual explanations of fraud risk factors with in-memory caching.
 */
export class LLMService {
  /** Singleton instance of OpenAI client to avoid multiple initializations */
  private static openai: OpenAI;
  
  /** In-memory cache for storing generated explanations to avoid redundant API calls */
  private static explanationCache: Map<string, string> = new Map();

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
   * Generates a unique cache key based on transaction parameters and triggered rules.
   * This ensures that identical transactions with the same risk factors return cached explanations.
   * 
   * @param amount - Transaction amount
   * @param currency - Three-letter currency code
   * @param email - Customer email address
   * @param triggeredRules - Array of triggered risk rules
   * @returns string - Unique cache key
   * 
   * @private
   */
  private static generateCacheKey(
    amount: number,
    currency: string,
    email: string,
    triggeredRules: string[]
  ): string {
    // Sort triggered rules to ensure consistent cache keys regardless of order
    const sortedRules = [...triggeredRules].sort();
    
    // Create a unique key combining all parameters
    return `${amount}-${currency}-${email}-${sortedRules.join('|')}`;
  }

  /**
   * Generates a natural language explanation of fraud risk factors using OpenAI GPT-3.5-turbo.
   * Creates a professional, contextual explanation based on transaction details and triggered risk rules.
   * Implements in-memory caching to avoid redundant API calls for identical transactions.
   * 
   * @param amount - Transaction amount in the specified currency
   * @param currency - Three-letter currency code (e.g., USD, EUR)
   * @param email - Customer email address
   * @param riskScore - Calculated fraud score (0.0 to 1.0)
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
    riskScore: number,
    triggeredRules: string[]
  ): Promise<string> {
    try {
      // Generate cache key for this specific transaction
      const cacheKey = this.generateCacheKey(amount, currency, email, triggeredRules);
      
      // Check if explanation already exists in cache
      if (this.explanationCache.has(cacheKey)) {
        console.log(`📋 Using cached explanation for transaction: ${amount} ${currency} to ${email}`);
        return this.explanationCache.get(cacheKey)!;
      }
      
      // Get OpenAI client instance
      const openai = this.getOpenAI();
      
      // Calculate risk percentage for better readability
      const riskPercentage = Math.round(riskScore * 100);
      
      // Build dynamic prompt by replacing placeholders in the template
      const prompt = LLM_PROMPT_TEMPLATE.FRAUD_EXPLANATION
        .replace('{amount}', amount.toString())
        .replace('{currency}', currency)
        .replace('{email}', email)
        .replace('{riskScore}', riskScore.toString())
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
      
      // Get final explanation (generated or fallback)
      const finalExplanation = generatedExplanation || this.generateFallbackExplanation(riskScore, triggeredRules);
      
      // Store the explanation in cache for future use
      this.explanationCache.set(cacheKey, finalExplanation);
      console.log(`💾 Cached explanation for transaction: ${amount} ${currency} to ${email}`);
      
      return finalExplanation;
      
    } catch (error) {
      // Log error for debugging purposes
      console.error('Error generating fraud explanation via OpenAI API:', error);
      // Generate fallback explanation
      const fallback = this.generateFallbackExplanation(riskScore, triggeredRules);
      // Cache the fallback explanation as well
      const cacheKey = this.generateCacheKey(amount, currency, email, triggeredRules);
      this.explanationCache.set(cacheKey, fallback);
      console.log(`💾 Cached fallback explanation for transaction: ${amount} ${currency} to ${email}`);
      // Return fallback explanation if API call fails
      return fallback;
    }
  }

  /**
   * Generates a fallback explanation when OpenAI API is unavailable or fails.
   * Provides a basic but informative explanation using the available data.
   * 
   * @param riskScore - Calculated fraud score (0.0 to 1.0)
   * @param triggeredRules - Array of risk factors that were triggered
   * @returns string - Fallback explanation
   * 
   * @private
   */
  private static generateFallbackExplanation(
    riskScore: number, 
    triggeredRules: string[]
  ): string {
    const riskPercentage = Math.round(riskScore * 100);
    
    if (triggeredRules.length === 0) {
      return `Transaction appears safe with ${riskPercentage}% risk score and no specific risk factors detected.`;
    }
    
    return `Transaction flagged with ${riskPercentage}% risk due to ${triggeredRules.join(', ').toLowerCase()}.`;
  }

  /**
   * Clears the in-memory explanation cache.
   * Useful for testing or when cache needs to be reset.
   * 
   * @public
   */
  public static clearCache(): void {
    this.explanationCache.clear();
    console.log('🗑️  Explanation cache cleared');
  }

  /**
   * Gets the current size of the explanation cache.
   * Useful for monitoring cache performance and memory usage.
   * 
   * @returns number - Number of cached explanations
   * 
   * @public
   */
  public static getCacheSize(): number {
    return this.explanationCache.size;
  }

  /**
   * Gets a specific cached explanation by cache key.
   * Useful for debugging and cache inspection.
   * 
   * @param cacheKey - The cache key to look up
   * @returns string | undefined - Cached explanation or undefined if not found
   * 
   * @public
   */
  public static getCachedExplanation(cacheKey: string): string | undefined {
    return this.explanationCache.get(cacheKey);
  }
} 