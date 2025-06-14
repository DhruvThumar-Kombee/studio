
'use server';

import { BillFiltersSchema, type BillFiltersFormInput } from '@/lib/schemas/billSchemas';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
import type { HospitalBillReport } from '@/types';
import { generateHospitalBillData } from '@/services/billService';

export async function generateHospitalBillReportAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<HospitalBillReport | null>> {
  
  const rawFormData = {
    hospitalId: formData.get('hospitalId') as string,
    dateFrom: formData.get('dateFrom') ? new Date(formData.get('dateFrom') as string) : undefined,
    dateTo: formData.get('dateTo') ? new Date(formData.get('dateTo') as string) : undefined,
  };

  const validationResult = BillFiltersSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    // console.error("Validation Errors:", validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the filter inputs.",
      errors: validationResult.error.issues,
      data: null,
    };
  }

  try {
    const reportData = await generateHospitalBillData(validationResult.data);
    if (!reportData || reportData.entries.length === 0) {
        return {
            success: true, // Success in terms of processing, but no data
            message: "No billable entries found for the selected criteria.",
            data: reportData // reportData could be null or have empty entries
        }
    }
    return {
      success: true,
      data: reportData,
      message: "Hospital bill report generated successfully.",
    };
  } catch (error) {
    // console.error("Bill Generation Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate hospital bill report.",
      data: null,
    };
  }
}
