import { Router } from 'express';
import { CacheController } from '../controllers/cache.controller';

const router = Router();

/**
 * @swagger
 * /cache/clear:
 *   delete:
 *     summary: Clear all cached LLM explanations
 *     description: |
 *       Clears the in-memory cache of LLM-generated fraud explanations.
 *       This is useful for testing, debugging, or when you want to force
 *       fresh explanations to be generated for subsequent requests.
 *     tags:
 *       - Cache Management
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     previousCacheSize:
 *                       type: number
 *                       description: Number of cached explanations before clearing
 *                       example: 15
 *                     currentCacheSize:
 *                       type: number
 *                       description: Number of cached explanations after clearing
 *                       example: 0
 *             example:
 *               success: true
 *               message: "Cache cleared successfully"
 *               data:
 *                 previousCacheSize: 15
 *                 currentCacheSize: 0
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/cache/clear', CacheController.clearCache);

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: |
 *       Returns current statistics about the LLM explanation cache,
 *       including the number of cached explanations and cache status.
 *       Useful for monitoring cache performance and memory usage.
 *     tags:
 *       - Cache Management
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cacheSize:
 *                       type: number
 *                       description: Number of cached explanations
 *                       example: 23
 *                     cacheStatus:
 *                       type: string
 *                       description: Status of the cache (active or empty)
 *                       example: "active"
 *             examples:
 *               active_cache:
 *                 summary: Cache with stored explanations
 *                 value:
 *                   success: true
 *                   message: "Cache statistics retrieved successfully"
 *                   data:
 *                     cacheSize: 23
 *                     cacheStatus: "active"
 *               empty_cache:
 *                 summary: Empty cache
 *                 value:
 *                   success: true
 *                   message: "Cache statistics retrieved successfully"
 *                   data:
 *                     cacheSize: 0
 *                     cacheStatus: "empty"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/cache/stats', CacheController.getCacheStats);

export default router; 