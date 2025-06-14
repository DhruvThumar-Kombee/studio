
import { z } from 'zod';
import { EmployeeRoles, type EmployeeRole } from '@/types';

const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmployeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Employee name must be at least 2 characters."),
  role: z.enum(EmployeeRoles, {
    required_error: "Employee role is required.",
    errorMap: () => ({ message: "Invalid employee role selected." }),
  }),
  contact: z.string().optional().refine(val => {
    if (!val || val.trim() === '') return true; // Optional, so empty is fine
    return phoneRegex.test(val) || emailRegex.test(val);
  }, "Contact must be a valid 10-digit phone number or an email address."),
  isActive: z.boolean().optional(),
});

export type EmployeeFormInput = z.infer<typeof EmployeeSchema>;
