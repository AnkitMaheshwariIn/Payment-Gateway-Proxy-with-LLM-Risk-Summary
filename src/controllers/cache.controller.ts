import { Request, Response } from 'express';
import { LLMService } from '../services/llm.service';

/**
 * Controller for managing LLM explanation cache
 */
export class CacheController {
  /**
   * Clear all cached explanations
   */
  static clearCache(_req: Request, res: Response): void {
    try {
      const previousSize = LLMService.getCacheSize();
      LLMService.clearCache();
      
      res.json({
        success: true,
        message: 'Cache cleared successfully',
        data: {
          previousCacheSize: previousSize,
          currentCacheSize: 0
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(_req: Request, res: Response): void {
    try {
      const cacheSize = LLMService.getCacheSize();
      
      res.json({
        success: true,
        message: 'Cache statistics retrieved successfully',
        data: {
          cacheSize,
          cacheStatus: cacheSize > 0 ? 'active' : 'empty'
        }
      });
    } catch (error) {
      console.error('Error getting cache stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cache statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 