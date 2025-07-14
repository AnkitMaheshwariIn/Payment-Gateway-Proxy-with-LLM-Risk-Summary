import fs from 'fs';
import path from 'path';

/**
 * Utility class for loading JSON configuration files
 */
export class ConfigLoader {
  private static cache = new Map<string, any>();

  /**
   * Load a JSON configuration file with caching
   * @param configName - Name of the config file (without .json extension)
   * @returns Parsed JSON configuration
   */
  static loadConfig<T = any>(configName: string): T {
    // Check cache first
    if (this.cache.has(configName)) {
      return this.cache.get(configName);
    }

    try {
      // Try to load from dist/config first (for production builds)
      let configPath = path.join(__dirname, '../config', `${configName}.json`);
      
      // If not found in dist, try src (for development)
      if (!fs.existsSync(configPath)) {
        configPath = path.join(__dirname, '../../src/config', `${configName}.json`);
      }

      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file ${configName}.json not found`);
      }

      const configData = fs.readFileSync(configPath, 'utf8');
      const parsedConfig = JSON.parse(configData);
      
      // Cache the result
      this.cache.set(configName, parsedConfig);
      
      return parsedConfig;
    } catch (error) {
      console.error(`❌ Failed to load configuration ${configName}:`, error);
      throw error;
    }
  }

  /**
   * Load risky domains configuration
   */
  static loadRiskyDomains(): string[] {
    const config = this.loadConfig<{ riskyDomains: string[] }>('riskyDomains');
    return config.riskyDomains;
  }

  /**
   * Load supported currencies configuration
   */
  static loadSupportedCurrencies(): Array<{ code: string; name: string; symbol: string; isActive: boolean }> {
    const config = this.loadConfig<{ supportedCurrencies: Array<{ code: string; name: string; symbol: string; isActive: boolean }> }>('currencies');
    return config.supportedCurrencies;
  }

  /**
   * Get list of active currency codes
   */
  static getActiveCurrencyCodes(): string[] {
    const currencies = this.loadSupportedCurrencies();
    return currencies.filter(currency => currency.isActive).map(currency => currency.code);
  }

  /**
   * Clear the configuration cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
} 