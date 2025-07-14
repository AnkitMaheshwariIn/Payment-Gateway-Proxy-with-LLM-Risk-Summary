import request from 'supertest';
import app from '../index';
import { LLMService } from '../services/llm.service';

describe('CacheController', () => {
  beforeEach(() => {
    // Clear cache before each test
    LLMService.clearCache();
  });

  afterEach(() => {
    // Clear cache after each test
    LLMService.clearCache();
  });

  describe('DELETE /cache/clear', () => {
    it('should clear the cache and return success response', async () => {
      // First, add some items to cache by making a charge request
      await request(app)
        .post('/charge')
        .send({
          amount: 100,
          currency: 'USD',
          source: 'stripe',
          email: 'test@example.com'
        });

      // Verify cache has items
      expect(LLMService.getCacheSize()).toBeGreaterThan(0);

      // Clear the cache
      const response = await request(app)
        .delete('/cache/clear')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Cache cleared successfully',
        data: {
          previousCacheSize: expect.any(Number),
          currentCacheSize: 0
        }
      });

      // Verify cache is actually cleared
      expect(LLMService.getCacheSize()).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock LLMService to throw an error
      const originalClearCache = LLMService.clearCache;
      LLMService.clearCache = jest.fn().mockImplementation(() => {
        throw new Error('Cache clear failed');
      });

      const response = await request(app)
        .delete('/cache/clear')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to clear cache',
        error: 'Cache clear failed'
      });

      // Restore original method
      LLMService.clearCache = originalClearCache;
    });
  });

  describe('GET /cache/stats', () => {
    it('should return cache statistics when cache is empty', async () => {
      const response = await request(app)
        .get('/cache/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Cache statistics retrieved successfully',
        data: {
          cacheSize: 0,
          cacheStatus: 'empty'
        }
      });
    });

    it('should return cache statistics when cache has items', async () => {
      // Add some items to cache by making a charge request
      await request(app)
        .post('/charge')
        .send({
          amount: 100,
          currency: 'USD',
          source: 'stripe',
          email: 'test@example.com'
        });

      const response = await request(app)
        .get('/cache/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Cache statistics retrieved successfully',
        data: {
          cacheSize: expect.any(Number),
          cacheStatus: 'active'
        }
      });

      expect(response.body.data.cacheSize).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock LLMService to throw an error
      const originalGetCacheSize = LLMService.getCacheSize;
      LLMService.getCacheSize = jest.fn().mockImplementation(() => {
        throw new Error('Cache stats failed');
      });

      const response = await request(app)
        .get('/cache/stats')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to get cache statistics',
        error: 'Cache stats failed'
      });

      // Restore original method
      LLMService.getCacheSize = originalGetCacheSize;
    });
  });
}); 