
import { z } from 'zod';

const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_FILES = 10;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

const fileSchema = z.custom<File>((val) => val instanceof File, "Invalid file format.")
  .refine((file) => file.size > 0, "File cannot be empty.")
  .refine((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024, `Max individual file size is ${MAX_FILE_SIZE_MB}MB.`)
  .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), "Only PDF, JPG, PNG files are allowed.");

export const DischargeEntrySchema = z.object({
  admissionId: z.string().min(1, "Admission ID is required to link the discharge entry."),
  billGenerated: z.enum(['yes', 'no'], { required_error: "Please specify if a bill was generated." }),
  finalBillAmount: z.coerce.number().positive("Final bill amount must be a positive number.").optional(),
  documents: z.array(fileSchema)
    .min(1, "At least one discharge document is required.")
    .max(MAX_TOTAL_FILES, `You can upload a maximum of ${MAX_TOTAL_FILES} documents.`),
}).superRefine((data, ctx) => {
  if (data.billGenerated === 'yes' && (data.finalBillAmount === undefined || data.finalBillAmount <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Final bill amount is required and must be positive if bill generation is 'Yes'.",
      path: ['finalBillAmount'],
    });
  }
  // If billGenerated is 'no', finalBillAmount should ideally be cleared by form logic or be undefined.
  // If it's present and billGenerated is 'no', you could add an issue, but often it's just ignored.
});

export type DischargeEntryFormInput = z.infer<typeof DischargeEntrySchema>;
