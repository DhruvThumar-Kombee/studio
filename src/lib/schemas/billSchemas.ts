
import { z } from 'zod';

export const BillFiltersSchema = z.object({
  hospitalId: z.string().min(1, { message: "Hospital selection is required." }),
  dateFrom: z.date({ required_error: "Start date is required." }),
  dateTo: z.date({ required_error: "End date is required." }),
}).refine(data => data.dateTo >= data.dateFrom, {
  message: "End date cannot be earlier than start date.",
  path: ["dateTo"], // Attach error to the 'dateTo' field
});

export type BillFiltersFormInput = z.infer<typeof BillFiltersSchema>;
