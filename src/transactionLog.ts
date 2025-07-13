import { v4 as uuidv4 } from 'uuid';

export interface TransactionLogEntry {
  transactionId: string;
  timestamp: string;
  amount: number;
  currency: string;
  source: string;
  email: string;
  fraudScore: number;
  decision: 'approved' | 'blocked';
  llmExplanation: string;
}

export interface TransactionData {
  amount: number;
  currency: string;
  source: string;
  email: string;
  fraudScore: number;
  decision: 'approved' | 'blocked';
  llmExplanation: string;
}

// In-memory storage for transactions
const transactions: TransactionLogEntry[] = [];

/**
 * Logs a new transaction to the in-memory array
 * @param transactionData - The transaction data to log
 * @returns The created transaction log entry
 */
export function logTransaction(transactionData: TransactionData): TransactionLogEntry {
  const transaction: TransactionLogEntry = {
    transactionId: uuidv4(),
    timestamp: new Date().toISOString(),
    ...transactionData
  };
  
  transactions.push(transaction);
  return transaction;
}

/**
 * Returns all logged transactions
 * @returns Array of all transaction log entries
 */
export function getAllTransactions(): TransactionLogEntry[] {
  return [...transactions]; // Return a copy to prevent external modification
} 