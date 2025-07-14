import request from 'supertest';
import app from './index';
import { PAYMENT_SOURCES } from './constants/app.constants';

describe('POST /charge', () => {
  const validChargeData = {
    amount: 100,
    currency: 'USD',
    source: PAYMENT_SOURCES.STRIPE,
    email: 'user@company.com'
  };

  it('should return 200 with safe status and fraud score for low-risk transaction', async () => {
    const response = await request(app)
      .post('/charge')
      .send(validChargeData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      transactionId: expect.any(String),
      amount: validChargeData.amount,
      currency: validChargeData.currency,
      status: 'safe',
      fraudScore: expect.any(Number),
      triggeredRules: expect.any(Array),
      llmExplanation: expect.any(String)
    }));
  });

  it('should return 400 for invalid amount (negative)', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, amount: -50 })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Amount must be a positive number',
      data: null
    });
  });

  it('should return 400 for invalid amount (zero)', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, amount: 0 })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Amount must be a positive number',
      data: null
    });
  });

  it('should return 400 for invalid currency (not 3 letters)', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, currency: 'US' })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Currency must be a 3-letter uppercase string (e.g., \'USD\')',
      data: null
    });
  });

  it('should return 400 for invalid currency (lowercase)', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, currency: 'usd' })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Currency must be a 3-letter uppercase string (e.g., \'USD\')',
      data: null
    });
  });

  it('should return 400 for invalid source', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, source: 'square' })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: `Source must be either '${PAYMENT_SOURCES.STRIPE}' or '${PAYMENT_SOURCES.PAYPAL}'`,
      data: null
    });
  });

  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, email: 'invalid-email' })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Email must be a valid email format',
      data: null
    });
  });

  it('should accept paypal as valid source', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, source: PAYMENT_SOURCES.PAYPAL })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      transactionId: expect.any(String),
      amount: validChargeData.amount,
      currency: validChargeData.currency,
      status: 'safe',
      fraudScore: expect.any(Number),
      triggeredRules: expect.any(Array),
      llmExplanation: expect.any(String)
    }));
  });

  it('should accept different currencies', async () => {
    const response = await request(app)
      .post('/charge')
      .send({ ...validChargeData, currency: 'EUR' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      transactionId: expect.any(String),
      amount: validChargeData.amount,
      currency: 'EUR',
      status: 'safe',
      fraudScore: expect.any(Number),
      triggeredRules: expect.any(Array),
      llmExplanation: expect.any(String)
    }));
  });

  // Fraud scoring tests
  it('should return 403 for high-risk transaction (high amount + risky domain)', async () => {
    const highRiskData = {
      ...validChargeData,
      amount: 6000,
      email: 'user@example.ru'
    };

    const response = await request(app)
      .post('/charge')
      .send(highRiskData)
      .expect(403);

    expect(response.body).toEqual({
      success: false,
      message: 'Charge declined due to high fraud risk',
      data: expect.objectContaining({
        transactionId: expect.any(String),
        amount: highRiskData.amount,
        currency: highRiskData.currency,
        status: 'declined',
        fraudScore: expect.closeTo(0.7, 2),
        triggeredRules: expect.any(Array),
        llmExplanation: expect.any(String)
      })
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

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      transactionId: expect.any(String),
      amount: mediumRiskData.amount,
      currency: mediumRiskData.currency,
      status: 'safe',
      fraudScore: expect.any(Number),
      triggeredRules: expect.any(Array),
      llmExplanation: expect.any(String)
    }));
  });

  it('should return 403 for high-risk transaction (risky domain + non-standard currency)', async () => {
    const highRiskData = {
      ...validChargeData,
      email: 'user@example.xyz',
      currency: 'JPY'
    };

    const response = await request(app)
      .post('/charge')
      .send(highRiskData)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Charge declined due to high fraud risk');
    expect(response.body.data).toEqual(expect.objectContaining({
      transactionId: expect.any(String),
      amount: highRiskData.amount,
      currency: highRiskData.currency,
      status: 'declined',
      fraudScore: expect.closeTo(0.6, 2),
      triggeredRules: expect.any(Array),
      llmExplanation: expect.any(String)
    }));
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

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      transactionId: expect.any(String),
      amount: safeData.amount,
      currency: safeData.currency,
      status: 'safe',
      fraudScore: expect.any(Number),
      triggeredRules: expect.any(Array),
      llmExplanation: expect.any(String)
    }));
  });

  it('should return 403 for high-risk transaction with multiple factors', async () => {
    const highRiskData = {
      ...validChargeData,
      amount: 6000,
      email: 'user@example.ru',
      currency: 'JPY'
    };

    const response = await request(app)
      .post('/charge')
      .send(highRiskData)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Charge declined due to high fraud risk');
    expect(response.body.data).toEqual(expect.objectContaining({
      transactionId: expect.any(String),
      amount: highRiskData.amount,
      currency: highRiskData.currency,
      status: 'declined',
      fraudScore: expect.closeTo(0.9, 2),
      triggeredRules: expect.any(Array),
      llmExplanation: expect.any(String)
    }));
  });

  it('should handle missing required fields', async () => {
    const response = await request(app)
      .post('/charge')
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: expect.any(String),
      data: null
    });
  });

  it('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/charge')
      .send('invalid json')
      .set('Content-Type', 'application/json')
      .expect(400);

    // Accept either an empty object or a generic error response
    expect([{}, { success: false, message: expect.any(String), data: null }]).toContainEqual(response.body);
  });
}); 