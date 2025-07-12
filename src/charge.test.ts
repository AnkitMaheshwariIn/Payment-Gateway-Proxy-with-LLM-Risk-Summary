import request from 'supertest';
import app from './index';
import { PAYMENT_SOURCES, RESPONSE_STATUS } from './constants/app.constants';

describe('POST /charge', () => {
  const validChargeData = {
    amount: 100,
    currency: 'USD',
    source: PAYMENT_SOURCES.STRIPE,
    email: 'test@example.com'
  };

  it('should return 200 with valid data', async () => {
    const response = await request(app)
      .post('/charge')
      .send(validChargeData)
      .expect(200);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.VALID,
      data: validChargeData
    });
  });

  it('should return 400 for invalid amount (negative)', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, amount: -50 })
      .expect(400);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: 'Amount must be a positive number'
    });
  });

  it('should return 400 for invalid amount (zero)', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, amount: 0 })
      .expect(400);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: 'Amount must be a positive number'
    });
  });

  it('should return 400 for invalid currency (not 3 letters)', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, currency: 'US' })
      .expect(400);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: 'Currency must be a 3-letter string (e.g., \'USD\')'
    });
  });

  it('should return 400 for invalid currency (lowercase)', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, currency: 'usd' })
      .expect(400);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: 'Currency must be a 3-letter string (e.g., \'USD\')'
    });
  });

  it('should return 400 for invalid source', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, source: 'square' })
      .expect(400);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: `Source must be either '${PAYMENT_SOURCES.STRIPE}' or '${PAYMENT_SOURCES.PAYPAL}'`
    });
  });

  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, email: 'invalid-email' })
      .expect(400);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: 'Email must be a valid email format'
    });
  });

  it('should accept paypal as valid source', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, source: PAYMENT_SOURCES.PAYPAL })
      .expect(200);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.VALID,
      data: { ...validChargeData, source: PAYMENT_SOURCES.PAYPAL }
    });
  });

  it('should accept different currencies', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, currency: 'EUR' })
      .expect(200);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.VALID,
      data: { ...validChargeData, currency: 'EUR' }
    });
  });
}); 