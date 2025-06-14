
'use server';

import { ReportFiltersSchema, type ReportFiltersFormInput } from '@/lib/schemas/reportSchemas';
import type { ReportActionResponse, ReportTypeValue, ClaimReportItem } from '@/types';
import { ReportType } from '@/types';
import { getTotalClaimsReport } from '@/services/reportService';

export async function generateReportAction(
  prevState: any,
  formData: FormData
): Promise<ReportActionResponse> {
  
  const rawFormData: Record<string, any> = {
    reportType: formData.get('reportType') as string, // Keep as string for initial Zod parse
    // Dates will be parsed carefully
  };

  const hospitalIdValue = formData.get('hospitalId') as string | null;
  if (hospitalIdValue !== null && hospitalIdValue !== '') {
    rawFormData.hospitalId = hospitalIdValue;
  } else {
    rawFormData.hospitalId = undefined; // Ensure it's undefined for Zod .optional()
  }
  
  const partyIdValue = formData.get('partyId') as string | null; // For TPA/Insurance
  if (partyIdValue !== null && partyIdValue !== '') {
    rawFormData.partyId = partyIdValue;
  } else {
    rawFormData.partyId = undefined;
  }

  const dateFromStr = formData.get('dateFrom') as string | null;
  const dateToStr = formData.get('dateTo') as string | null;

  if (dateFromStr) rawFormData.dateFrom = new Date(dateFromStr);
  if (dateToStr) rawFormData.dateTo = new Date(dateToStr);
  
  const validationResult = ReportFiltersSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.error("Report Validation Errors:", validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the filter inputs.",
      errors: validationResult.error.issues,
    };
  }

  const filters = validationResult.data;

  try {
    let reportData: any;
    switch (filters.reportType) {
      case ReportType.TOTAL_CLAIMS:
        reportData = await getTotalClaimsReport(filters);
        break;
      // Add cases for other report types here
      // case ReportType.OUTSTANDING_CLAIMS:
      //   reportData = await getOutstandingClaimsReport(filters);
      //   break;
      default:
        return { success: false, message: "Selected report type is not yet implemented." };
    }

    if (!reportData || (Array.isArray(reportData) && reportData.length === 0)) {
      return {
        success: true,
        reportType: filters.reportType,
        message: "No data found for the selected criteria.",
        data: [],
      };
    }

    return {
      success: true,
      reportType: filters.reportType,
      data: reportData,
      message: "Report generated successfully.",
    };
  } catch (error) {
    console.error("Report Generation Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate report.",
    };
  }
}

