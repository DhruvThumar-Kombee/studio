
'use server';

import {
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  calculateOverallBalanceSummary,
} from '@/services/transactionService';
import type { Transaction, BalanceSummary } from '@/types';
import { TransactionSchema, type TransactionFormInput } from '@/lib/schemas/transactionSchemas';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
import { revalidatePath } from 'next/cache';

const TRANSACTIONS_ADMIN_PATH = '/dashboard/admin/transactions';

// Helper function to parse FormData to TransactionFormInput, especially for date
function parseFormDataToTransactionInput(formData: FormData): TransactionFormInput {
  const rawData: { [key: string]: any } = {};
  for (const [key, value] of formData.entries()) {
    if (key === 'date' && typeof value === 'string') {
      rawData[key] = new Date(value);
    } else if (key === 'amount' && typeof value === 'string') {
      const numValue = parseFloat(value);
      rawData[key] = isNaN(numValue) ? value : numValue; // Keep as string if not a number for Zod to catch
    }
    else {
      rawData[key] = value;
    }
  }
  return rawData as TransactionFormInput;
}


export async function createTransactionAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<Transaction>> {
  const rawFormData = parseFormDataToTransactionInput(formData);
  const validationResult = TransactionSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.error("Transaction Validation Errors:", validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the fields.",
      errors: validationResult.error.issues,
    };
  }

  try {
    const newTransaction = await addTransaction(validationResult.data as Omit<Transaction, 'id'>);
    revalidatePath(TRANSACTIONS_ADMIN_PATH);
    return {
      success: true,
      data: newTransaction,
      message: "Transaction created successfully.",
    };
  } catch (error) {
    console.error("Transaction Creation Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create transaction.",
    };
  }
}

export async function updateTransactionAction(
  transactionId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResponse<Transaction>> {
  const rawFormData = parseFormDataToTransactionInput(formData);
  const validationResult = TransactionSchema.safeParse(rawFormData);

  if (!validationResult.success) {
     console.error("Transaction Update Validation Errors:", validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the fields.",
      errors: validationResult.error.issues,
    };
  }

  try {
    const updatedTransaction = await updateTransaction(transactionId, validationResult.data);
    if (!updatedTransaction) {
      return { success: false, message: "Transaction not found." };
    }
    revalidatePath(TRANSACTIONS_ADMIN_PATH);
    return {
      success: true,
      data: updatedTransaction,
      message: "Transaction updated successfully.",
    };
  } catch (error) {
    console.error("Transaction Update Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update transaction.",
    };
  }
}

export async function deleteTransactionAction(transactionId: string): Promise<ActionResponse<null>> {
  try {
    const success = await deleteTransaction(transactionId);
    if (!success) {
      return { success: false, message: "Transaction not found or already deleted." };
    }
    revalidatePath(TRANSACTIONS_ADMIN_PATH);
    return { success: true, message: "Transaction deleted successfully." };
  } catch (error) {
    console.error("Transaction Deletion Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete transaction.",
    };
  }
}

export async function getTransactionsAction(): Promise<Transaction[]> {
  return getAllTransactions();
}

export async function getOverallBalanceSummaryAction(): Promise<BalanceSummary> {
  return calculateOverallBalanceSummary();
}
