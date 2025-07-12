import request from 'supertest';
import app from './index';

describe('Health Check Endpoint', () => {
  it('should return status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
}); 