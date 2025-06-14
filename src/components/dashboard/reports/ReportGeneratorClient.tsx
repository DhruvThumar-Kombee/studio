
"use client";

import * as React from 'react';
import { useActionState, useFormStatus } from 'react-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReportFiltersSchema, type ReportFiltersFormInput } from '@/lib/schemas/reportSchemas';
import type { ReportActionResponse, ReportTypeValue, SelectOption, ClaimReportItem } from '@/types';
import { ReportType } from '@/types'; // Enum for report types
import { generateReportAction } from '@/actions/reportActions';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileSearch, Printer, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TotalClaimsReportTable } from './TotalClaimsReportTable';
// Import other report tables here as they are created
// e.g., import { OutstandingClaimsReportTable } from './OutstandingClaimsReportTable';

const initialActionState: ReportActionResponse = {
  success: false,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
      Generate Report
    </Button>
  );
}

interface ReportGeneratorClientProps {
  availableHospitals: SelectOption[];
  // availableParties: SelectOption[]; // For TPA/Insurance filter later
}

// Define report types available for selection in the dropdown
const reportTypeOptions: SelectOption[] = [
  { value: ReportType.TOTAL_CLAIMS, label: 'Total Claims Report' },
  // Add other report types here as they are implemented
  // { value: ReportType.OUTSTANDING_CLAIMS, label: 'Outstanding Claims Report' },
  // { value: ReportType.PAYMENTS, label: 'Payments Report' },
];

export function ReportGeneratorClient({ availableHospitals }: ReportGeneratorClientProps) {
  const [reportState, formAction] = React.useActionState(generateReportAction, initialActionState);
  const { toast } = useToast();
  const reportContentRef = React.useRef<HTMLDivElement>(null);

  const { control, handleSubmit, formState: { errors: formErrors }, reset, watch } = useForm<ReportFiltersFormInput>({
    resolver: zodResolver(ReportFiltersSchema),
    defaultValues: {
      reportType: ReportType.TOTAL_CLAIMS, // Default report type
      dateFrom: undefined,
      dateTo: undefined,
      hospitalId: undefined,
      // partyId: undefined,
    },
  });
  
  const selectedReportType = watch('reportType');

  React.useEffect(() => {
    if (reportState.message) {
      toast({
        title: reportState.success ? "Report Status" : "Report Error",
        description: reportState.message,
        variant: reportState.success ? "default" : "destructive",
      });
    }
  }, [reportState, toast]);

  const onValidSubmit = (data: ReportFiltersFormInput) => {
    const formData = new FormData();
    formData.append('reportType', data.reportType);
    if (data.dateFrom) formData.append('dateFrom', data.dateFrom.toISOString());
    if (data.dateTo) formData.append('dateTo', data.dateTo.toISOString());
    if (data.hospitalId) formData.append('hospitalId', data.hospitalId);
    // if (data.partyId) formData.append('partyId', data.partyId);
    formAction(formData);
  };

  const handlePrint = () => {
    if (reportContentRef.current && reportState.success && reportState.data) {
      const reportTitle = reportTypeOptions.find(opt => opt.value === reportState.reportType)?.label || "Report";
      const printWindow = window.open('', '_blank', 'height=800,width=1000');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print - ' + reportTitle + '</title>');
        printWindow.document.write('<style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}.no-print{display:none;} @media print { body { margin: 0.5cm; } h1 { page-break-before: auto; } table { page-break-inside: auto; } tr { page-break-inside: avoid; page-break-after: auto; } thead { display: table-header-group; } tfoot { display: table-footer-group; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>' + reportTitle + '</h1>');
        // Optional: Add filter criteria to print header
        // printWindow.document.write('<div>Filters: ...</div>');
        printWindow.document.write(reportContentRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
      }
    } else {
      toast({ title: "Print Error", description: "No report content to print or report generation failed.", variant: "destructive" });
    }
  };

  const renderReportTable = () => {
    if (!reportState.success || !reportState.data || (Array.isArray(reportState.data) && reportState.data.length === 0)) {
      if (reportState.message && reportState.message !== "Report generated successfully.") { // Avoid showing "no data" if a specific message like "No data found" is already there.
         return (
            <Alert variant="default" className="mt-6 bg-blue-50 border-blue-200 text-blue-700">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>{reportState.message || "Generate a report to see data."}</AlertDescription>
            </Alert>
        );
      }
      return null;
    }

    switch (reportState.reportType) {
      case ReportType.TOTAL_CLAIMS:
        return <TotalClaimsReportTable data={reportState.data as ClaimReportItem[]} />;
      // Add cases for other report types here
      // case ReportType.OUTSTANDING_CLAIMS:
      //   return <OutstandingClaimsReportTable data={reportState.data as OutstandingClaimItem[]} />;
      default:
        return <p className="text-muted-foreground mt-4">Selected report type display not implemented.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4 p-4 border rounded-md bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* Report Type Selector */}
          <div className="space-y-1">
            <Label htmlFor="reportType">Report Type <span className="text-destructive">*</span></Label>
            <Controller
              name="reportType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="reportType">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {reportTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {formErrors.reportType && <p className="text-sm text-destructive mt-1">{formErrors.reportType.message}</p>}
          </div>

          {/* Hospital Filter */}
          <div className="space-y-1">
            <Label htmlFor="hospitalId">Hospital (Optional)</Label>
            <Controller
              name="hospitalId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''} disabled={availableHospitals.length === 0}>
                  <SelectTrigger id="hospitalId">
                    <SelectValue placeholder="All Hospitals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Hospitals</SelectItem>
                    {availableHospitals.map(hospital => (
                      <SelectItem key={hospital.value} value={hospital.value}>{hospital.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {formErrors.hospitalId && <p className="text-sm text-destructive mt-1">{formErrors.hospitalId.message}</p>}
          </div>
          
          {/* Date From Filter */}
          <div className="space-y-1">
            <Label htmlFor="dateFrom">Date From (Optional)</Label>
            <Controller
              name="dateFrom"
              control={control}
              render={({ field }) => (
                <DatePicker date={field.value} setDate={field.onChange} placeholder="Start date" 
                            disabled={(date) => date > new Date()} />
              )}
            />
            {formErrors.dateFrom && <p className="text-sm text-destructive mt-1">{formErrors.dateFrom.message}</p>}
          </div>

          {/* Date To Filter */}
          <div className="space-y-1">
            <Label htmlFor="dateTo">Date To (Optional)</Label>
            <Controller
              name="dateTo"
              control={control}
              render={({ field }) => (
                <DatePicker date={field.value} setDate={field.onChange} placeholder="End date"
                            disabled={(date) => date > new Date()} />
              )}
            />
            {formErrors.dateTo && <p className="text-sm text-destructive mt-1">{formErrors.dateTo.message}</p>}
          </div>

          {/* Party (TPA/Insurance) Filter - Placeholder for future */}
          {/* <div className="space-y-1">
            <Label htmlFor="partyId">TPA/Insurance Co. (Optional)</Label>
            <Controller ... />
          </div> */}
        </div>
        {formErrors.root && <p className="text-sm text-destructive mt-1 text-center">{formErrors.root.message}</p>}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
           <Button type="button" variant="outline" onClick={() => reset({ reportType: ReportType.TOTAL_CLAIMS, dateFrom: undefined, dateTo: undefined, hospitalId: undefined })} className="w-full sm:w-auto">
            Reset Filters
          </Button>
          <SubmitButton />
        </div>
      </form>

      {/* Display server-side form/action errors */}
      {reportState?.errors && reportState.errors.length > 0 && !reportState.success && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {reportState.message || "Report generation failed. Please check your inputs."}
            <ul className="list-disc list-inside text-xs mt-1">
              {reportState.errors.map((err: any, index: number) => (
                <li key={index}>{`${err.path.join('.')} : ${err.message}`}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Report Display Area */}
      {reportState.success && reportState.data && (Array.isArray(reportState.data) && reportState.data.length > 0) && (
        <div className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Print Report
            </Button>
            {/* Placeholder for Export to Excel/PDF */}
            {/* <Button variant="outline" className="ml-2" disabled>Export Excel (Soon)</Button> */}
          </div>
          <div ref={reportContentRef}>
            {renderReportTable()}
          </div>
        </div>
      )}
       {(reportState.success && (!reportState.data || (Array.isArray(reportState.data) && reportState.data.length === 0))) && (
         <Alert variant="default" className="mt-6 bg-blue-50 border-blue-200 text-blue-700">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            {reportState.message || "No data found for the selected criteria."}
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
}
