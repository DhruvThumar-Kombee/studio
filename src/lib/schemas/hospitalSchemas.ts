
import { z } from 'zod';
import type { CommissionType } from '@/types';

const phoneRegex = /^[0-9]{10}$/; // Simple 10-digit phone number

export const HospitalReferenceSchema = z.object({
  name: z.string().min(1, "Reference name is required."),
  mobile: z.string().regex(phoneRegex, "Invalid mobile number format (must be 10 digits)."),
  commissionType: z.enum(['Fixed', 'Percentage'], { required_error: "Commission type is required." }),
  commissionValue: z.number({ invalid_type_error: "Commission value must be a number." })
    .min(0, "Commission value must be non-negative."),
});

export const HospitalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Hospital name is required."),
  address: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')), // Allow empty string or valid email
  mobile: z.string().regex(phoneRegex, "Invalid mobile number format (must be 10 digits).").optional().or(z.literal('')),
  assignedDoctorIds: z.array(z.string()).min(0, "At least one doctor must be assigned."),
  associatedServiceIds: z.array(z.string()).min(0, "At least one service must be associated."),
  reference: HospitalReferenceSchema,
  isActive: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.reference.commissionType === 'Percentage') {
    if (data.reference.commissionValue < 0 || data.reference.commissionValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage commission must be between 0 and 100.",
        path: ['reference', 'commissionValue'],
      });
    }
  }
  // No specific refinement needed for 'Fixed' commissionValue beyond min(0)
  // as any positive number is valid.
});

export type HospitalFormInput = z.infer<typeof HospitalSchema>;
