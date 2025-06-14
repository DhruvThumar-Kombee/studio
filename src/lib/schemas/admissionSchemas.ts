
import { z } from 'zod';
import type { Gender } from '@/types';

const phoneRegex = /^[0-9]{10}$/; // Simple 10-digit phone number
const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_FILES = 10;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

const fileSchema = z.custom<File>((val) => val instanceof File, "Invalid file format.")
  .refine((file) => file.size > 0, "File cannot be empty.")
  .refine((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024, `Max individual file size is ${MAX_FILE_SIZE_MB}MB.`)
  .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), "Only PDF, JPG, PNG files are allowed.");


export const PatientAdmissionSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters long."),
  patientAge: z.coerce.number({invalid_type_error: "Patient age must be a number."}).positive("Age must be positive.").max(120, "Age seems too high."),
  patientGender: z.enum(['Male', 'Female', 'Other'] as [Gender, ...Gender[]], { required_error: "Gender is required." }),
  patientContact: z.string().regex(phoneRegex, "Invalid contact number format (must be 10 digits)."),
  tpaId: z.string().min(1, "TPA selection is required."),
  admissionDate: z.date({ required_error: "Admission date is required." }),
  associatedServiceIds: z.array(z.string()).min(1, "At least one service must be selected."),
  documents: z.array(fileSchema)
    .min(1, "At least one admission document is required.")
    .max(MAX_TOTAL_FILES, `You can upload a maximum of ${MAX_TOTAL_FILES} documents.`),
});

export type PatientAdmissionFormInput = z.infer<typeof PatientAdmissionSchema>;
