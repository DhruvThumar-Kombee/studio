
import { z } from 'zod';
import type { Service, PriceType } from '@/types';

export const slabSchema = z.object({
  basePrice: z.number({invalid_type_error: "Base price must be a number."}).min(0, "Base price must be non-negative."),
  baseLimit: z.number({invalid_type_error: "Base limit must be a number."}).min(0, "Base limit must be non-negative."),
  additionalPricePerSlab: z.number({invalid_type_error: "Additional price must be a number."}).min(0, "Additional price must be non-negative."),
  slabSize: z.number({invalid_type_error: "Slab size must be a number."}).positive("Slab size must be positive."),
});

export const ServiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Service name is required."),
  priceType: z.enum(['Fixed', 'Slab-Based'], { required_error: "Price type is required." }),
  fixedPrice: z.number({invalid_type_error: "Fixed price must be a number."}).min(0, "Fixed price must be non-negative.").optional(),
  slabs: slabSchema.optional(),
  isActive: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.priceType === 'Fixed') {
    if (data.fixedPrice === undefined || data.fixedPrice === null || data.fixedPrice < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fixed price is required and must be non-negative for Fixed price type.",
        path: ['fixedPrice'],
      });
    }
  } else if (data.priceType === 'Slab-Based') {
    if (!data.slabs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Slab details are required for Slab-Based price type.",
        path: ['slabs'], 
      });
    }
  }
});

export type ServiceFormInput = z.infer<typeof ServiceSchema>;

export interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: z.ZodIssue[];
}
