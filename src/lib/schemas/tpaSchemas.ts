
import { z } from 'zod';

const phoneRegex = /^[0-9]{10}$/; // Simple 10-digit phone number

export const TPASchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "TPA name is required."),
  address: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')), // Allow empty string or valid email
  mobile: z.string().regex(phoneRegex, "Invalid mobile number format (must be 10 digits).").optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type TPAFormInput = z.infer<typeof TPASchema>;

// Re-using ActionResponse from serviceSchemas, or you can define a specific one here if needed.
// For now, we assume the generic ActionResponse from serviceSchemas.ts is sufficient.
// import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
