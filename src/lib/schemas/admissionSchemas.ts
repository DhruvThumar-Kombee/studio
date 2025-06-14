
import { z } from 'zod';
import type { Gender } from '@/types';

const phoneRegex = /^[0-9]{10}$/; // Simple 10-digit phone number
const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_FILES = 10;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const fileSchema = z.custom<File>((val) => val instanceof File, "Invalid file format");
// .refine((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024, `Max file size is ${MAX_FILE_SIZE_MB}MB.`)
// .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), "Only .pdf, .jpg, .png files are allowed.");
// File array validation for count needs to be handled at the array level or in component due to FileList nature

export const PatientInfoSchema = z.object({
  name: z.string().min(2, "Patient name must be at least 2 characters."),
  age: z.number({ invalid_type_error: "Age is required." }).int().positive("Age must be a positive number.").max(120, "Age seems too high."),
  gender: z.enum(['Male', 'Female', 'Other'] as [Gender, ...Gender[]], { required_error: "Gender is required." }),
  contactNumber: z.string().regex(phoneRegex, "Invalid contact number (must be 10 digits)."),
});

export const PatientAdmissionSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters long."),
  patientAge: z.coerce.number({invalid_type_error: "Patient age must be a number."}).positive("Age must be positive.").max(120, "Age seems too high."),
  patientGender: z.enum(['Male', 'Female', 'Other'] as [Gender, ...Gender[]], { required_error: "Gender is required." }),
  patientContact: z.string().regex(phoneRegex, "Invalid contact number format (must be 10 digits)."),
  tpaId: z.string().min(1, "TPA selection is required."),
  admissionDate: z.date({ required_error: "Admission date is required." }),
  documents: z.any().optional(), // Using z.any() for FileList temporarily.
                                 // Proper validation will be handled by the component / server action.
  // Add more fields as necessary, e.g., hospitalId if not derived from user context
});

export type PatientAdmissionFormInput = z.infer<typeof PatientAdmissionSchema>;
