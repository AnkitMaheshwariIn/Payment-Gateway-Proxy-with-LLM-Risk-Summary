import request from 'supertest';
import app from './index';
import { RESPONSE_STATUS } from './constants/app.constants';

describe('Health Check Endpoint', () => {
  it('should return status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: RESPONSE_STATUS.OK });
  });
}); 