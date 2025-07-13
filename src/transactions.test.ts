import request from 'supertest';
import app from './index';
import { RESPONSE_STATUS } from './constants/app.constants';
import { getAllTransactions } from './transactionLog';

// Mock the transaction log module to control its behavior
jest.mock('./transactionLog', () => {
  const originalModule = jest.requireActual('./transactionLog');
  return {
    ...originalModule,
    getAllTransactions: jest.fn()
  };
});

describe('GET /transactions', () => {
  const mockGetAllTransactions = getAllTransactions as jest.MockedFunction<typeof getAllTransactions>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty transactions array when no transactions exist', async () => {
    mockGetAllTransactions.mockReturnValue([]);

    const response = await request(app)
      .get('/transactions')
      .expect(200);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.OK,
      data: {
        transactions: [],
        count: 0
      }
    });
  });

  it('should return all stored transactions', async () => {
    const mockTransactions = [
      {
        transactionId: 'test-id-1',
        timestamp: '2025-07-13T17:27:48.193Z',
        amount: 100,
        currency: 'USD',
        source: 'stripe',
        email: 'test1@example.com',
        fraudScore: 0.3,
        decision: 'approved' as const,
        llmExplanation: 'Low risk transaction'
      },
      {
        transactionId: 'test-id-2',
        timestamp: '2025-07-13T17:27:48.193Z',
        amount: 5000,
        currency: 'EUR',
        source: 'paypal',
        email: 'test2@example.ru',
        fraudScore: 0.7,
        decision: 'blocked' as const,
        llmExplanation: 'High risk transaction'
      }
    ];

    mockGetAllTransactions.mockReturnValue(mockTransactions);

    const response = await request(app)
      .get('/transactions')
      .expect(200);

    expect(response.body.status).toBe(RESPONSE_STATUS.OK);
    expect(response.body.data.count).toBe(2);
    expect(response.body.data.transactions).toHaveLength(2);
    
    // Verify the transactions are returned with all expected fields
    const transactions = response.body.data.transactions;
    expect(transactions[0]).toMatchObject({
      transactionId: 'test-id-1',
      timestamp: '2025-07-13T17:27:48.193Z',
      amount: 100,
      currency: 'USD',
      source: 'stripe',
      email: 'test1@example.com',
      fraudScore: 0.3,
      decision: 'approved',
      llmExplanation: 'Low risk transaction'
    });

    expect(transactions[1]).toMatchObject({
      transactionId: 'test-id-2',
      timestamp: '2025-07-13T17:27:48.193Z',
      amount: 5000,
      currency: 'EUR',
      source: 'paypal',
      email: 'test2@example.ru',
      fraudScore: 0.7,
      decision: 'blocked',
      llmExplanation: 'High risk transaction'
    });

    // Verify transaction IDs are unique
    expect(transactions[0].transactionId).not.toBe(transactions[1].transactionId);
  });

  it('should return transactions in chronological order (newest first)', async () => {
    const mockTransactions = [
      {
        transactionId: 'test-id-2',
        timestamp: '2025-07-13T17:27:48.213Z',
        amount: 200,
        currency: 'EUR',
        source: 'paypal',
        email: 'test2@example.com',
        fraudScore: 0.0,
        decision: 'approved' as const,
        llmExplanation: 'Second transaction'
      },
      {
        transactionId: 'test-id-1',
        timestamp: '2025-07-13T17:27:48.202Z',
        amount: 100,
        currency: 'USD',
        source: 'stripe',
        email: 'test1@example.com',
        fraudScore: 0.0,
        decision: 'approved' as const,
        llmExplanation: 'First transaction'
      }
    ];

    mockGetAllTransactions.mockReturnValue(mockTransactions);

    const response = await request(app)
      .get('/transactions')
      .expect(200);

    const transactions = response.body.data.transactions;
    expect(transactions).toHaveLength(2);
    
    // Verify timestamps are in descending order (newest first)
    const timestamp1 = new Date(transactions[0].timestamp).getTime();
    const timestamp2 = new Date(transactions[1].timestamp).getTime();
    expect(timestamp1).toBeGreaterThanOrEqual(timestamp2);
  });

  it('should handle server errors gracefully', async () => {
    // Mock getAllTransactions to throw an error
    mockGetAllTransactions.mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/transactions')
      .expect(500);

    expect(response.body).toEqual({
      status: RESPONSE_STATUS.ERROR,
      error: 'Failed to retrieve transactions'
    });
  });
}); 