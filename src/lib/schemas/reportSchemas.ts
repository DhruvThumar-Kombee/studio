
import { z } from 'zod';
import { ReportType, type ReportTypeValue } from '@/types'; // Import ReportType constants

export const ReportFiltersSchema = z.object({
  reportType: z.nativeEnum(ReportType, {
    errorMap: () => ({ message: "Invalid report type selected." }),
  }),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  hospitalId: z.string().optional(),
  partyId: z.string().optional(), // For TPA/Insurance Company - can be refined later
}).refine(data => {
  // Validate date range only if both dates are provided
  if (data.dateFrom && data.dateTo) {
    return data.dateTo >= data.dateFrom;
  }
  return true;
}, {
  message: "End date cannot be earlier than start date.",
  path: ["dateTo"], // Path of the error
});

export type ReportFiltersFormInput = z.infer<typeof ReportFiltersSchema>;

// Specific schema for TotalClaims might not be needed if ReportFiltersSchema covers it
// but you could define specific input schemas per report type if they vary significantly.
