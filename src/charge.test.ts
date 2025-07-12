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

  it('should return 200 with safe status and fraud score for low-risk transaction', async () => {
    const response = await request(app)
      .post('/charge')
      .send(validChargeData)
      .expect(200);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.SAFE,
      data: validChargeData,
      fraudScore: 0,
      riskPercentage: 0
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
      status: RESPONSE_STATUS.SAFE,
      data: { ...validChargeData, currency: 'EUR' },
      fraudScore: 0,
      riskPercentage: 0
    });
  });

  // Fraud scoring tests
  it('should return 403 for high-risk transaction (high amount + risky domain)', async () => {
    const highRiskData = {
      ...validChargeData,
      amount: 6000,
      email: 'test@example.ru'
    };

    const response = await request(app)
      .post('/charge')
      .send(highRiskData)
      .expect(403);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: 'High risk',
      fraudScore: 0.7,
      riskPercentage: 70
    });
  });

  it('should return 200 for medium-risk transaction (high amount only)', async () => {
    const mediumRiskData = {
      ...validChargeData,
      amount: 6000
    };

    const response = await request(app)
      .post('/charge')
      .send(mediumRiskData)
      .expect(200);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.SAFE,
      data: mediumRiskData,
      fraudScore: 0.3,
      riskPercentage: 30
    });
  });

  it('should return 403 for high-risk transaction (risky domain + non-standard currency)', async () => {
    const highRiskData = {
      ...validChargeData,
      email: 'test@example.xyz',
      currency: 'GBP'
    };

    const response = await request(app)
      .post('/charge')
      .send(highRiskData)
      .expect(403);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: 'High risk',
      fraudScore: 0.6,
      riskPercentage: 60
    });
  });

  it('should return 200 for safe transaction with some risk factors', async () => {
    const safeData = {
      ...validChargeData,
      amount: 6000,
      currency: 'INR'
    };

    const response = await request(app)
      .post('/charge')
      .send(safeData)
      .expect(200);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.SAFE,
      data: safeData,
      fraudScore: 0.3,
      riskPercentage: 30
    });
  });
}); 