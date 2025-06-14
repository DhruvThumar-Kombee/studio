
'use server';
import type { Transaction, TransactionType, BalanceSummary } from '@/types';
import { TransactionFormInput } from '@/lib/schemas/transactionSchemas';
import { mockTransactions } from '@/lib/mock-data'; // Assuming mockTransactions is in mock-data.ts

// Simulating a database or API for transactions
let transactionsDB: Transaction[] = JSON.parse(JSON.stringify(mockTransactions));

export async function getAllTransactions(): Promise<Transaction[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
  return JSON.parse(JSON.stringify(transactionsDB.sort((a, b) => b.date.getTime() - a.date.getTime()))); // Sort by date descending
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newTransaction: Transaction = {
    ...transactionData,
    id: `txn-${Date.now()}${Math.floor(Math.random() * 1000)}`,
  };
  transactionsDB.push(newTransaction);
  return JSON.parse(JSON.stringify(newTransaction));
}

export async function updateTransaction(transactionId: string, updates: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const transactionIndex = transactionsDB.findIndex(t => t.id === transactionId);
  if (transactionIndex === -1) {
    return null;
  }
  transactionsDB[transactionIndex] = { ...transactionsDB[transactionIndex], ...updates };
  return JSON.parse(JSON.stringify(transactionsDB[transactionIndex]));
}

export async function deleteTransaction(transactionId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = transactionsDB.length;
  transactionsDB = transactionsDB.filter(t => t.id !== transactionId);
  return transactionsDB.length < initialLength;
}

export async function calculateOverallBalanceSummary(): Promise<BalanceSummary> {
  await new Promise(resolve => setTimeout(resolve, 100));
  let totalIncome = 0;
  let totalExpenses = 0;

  transactionsDB.forEach(txn => {
    if (txn.type === 'Income') {
      totalIncome += txn.amount;
    } else if (txn.type === 'Expense') {
      totalExpenses += txn.amount;
    }
  });

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
  };
}
