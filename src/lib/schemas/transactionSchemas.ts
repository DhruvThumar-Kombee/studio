
import { z } from 'zod';
import type { TransactionType } from '@/types';

export const TransactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['Income', 'Expense'] as [TransactionType, ...TransactionType[]], { 
    required_error: "Transaction type is required." 
  }),
  date: z.date({ 
    required_error: "Date is required.",
    invalid_type_error: "Invalid date format."
  }),
  amount: z.coerce.number({ // Use coerce for string input from forms
    required_error: "Amount is required.",
    invalid_type_error: "Amount must be a number."
  }).positive({ message: "Amount must be a positive number." }),
  description: z.string().min(1, "Description is required."),
  category: z.string().optional(),
});

export type TransactionFormInput = z.infer<typeof TransactionSchema>;
