
"use client";

import * as React from 'react';
import { useActionState, useFormStatus } from 'react-dom'; // useFormStatus remains in react-dom
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BillFiltersSchema, type BillFiltersFormInput } from '@/lib/schemas/billSchemas';
import type { HospitalBillReport, SelectOption } from '@/types';
import { generateHospitalBillReportAction } from '@/actions/billActions';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, Printer, AlertCircle } from 'lucide-react';
import { HospitalBillTable } from './HospitalBillTable';
import { useToast } from '@/hooks/use-toast';

const initialActionState: { success: boolean; message?: string; data?: HospitalBillReport | null; errors?: any[] } = {
  success: false,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Generate Report
    </Button>
  );
}

interface HospitalBillGeneratorClientProps {
  availableHospitals: SelectOption[];
}

export function HospitalBillGeneratorClient({ availableHospitals }: HospitalBillGeneratorClientProps) {
  const [reportState, formAction] = React.useActionState(generateHospitalBillReportAction, initialActionState); // Corrected: useActionState from react
  const { toast } = useToast();
  const reportTableRef = React.useRef<HTMLDivElement>(null);

  const { control, handleSubmit, formState: { errors: formErrors }, reset } = useForm<BillFiltersFormInput>({
    resolver: zodResolver(BillFiltersSchema),
    defaultValues: {
      hospitalId: '',
      dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Default to start of current month
      dateTo: new Date(), // Default to today
    },
  });

  React.useEffect(() => {
    if (reportState.message && !reportState.success && reportState.errors) {
      const errorDetails = reportState.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
      toast({
        title: "Report Generation Failed",
        description: `${reportState.message} ${errorDetails}`,
        variant: "destructive",
        duration: 7000,
      });
    } else if (reportState.message && reportState.success && !reportState.data?.entries?.length) {
       toast({
        title: "Report Generated",
        description: reportState.message, // e.g., "No billable entries found..."
        variant: "default",
      });
    } else if (reportState.message && reportState.success && reportState.data?.entries?.length) {
      toast({
        title: "Success",
        description: reportState.message,
        variant: "default",
      });
    }
  }, [reportState, toast]);

  const onValidSubmit = (data: BillFiltersFormInput) => {
    const formData = new FormData();
    formData.append('hospitalId', data.hospitalId);
    formData.append('dateFrom', data.dateFrom.toISOString());
    formData.append('dateTo', data.dateTo.toISOString());
    formAction(formData);
  };

  const handlePrint = () => {
    if (reportTableRef.current) {
      const hospitalName = reportState.data?.hospitalName || "Report";
      const dateFrom = reportState.data?.dateFrom || "";
      const dateTo = reportState.data?.dateTo || "";
      const printTitle = `Hospital Bill Report - ${hospitalName} (${dateFrom} to ${dateTo})`;
      
      const printWindow = window.open('', '_blank', 'height=800,width=1000');
      if (printWindow) {
        printWindow.document.write(`<html><head><title>${printTitle}</title>`);
        printWindow.document.write('<style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}h1,h2,h3{margin-bottom:0.5em}.summary-block{margin-top:20px;padding:10px;border:1px solid #eee;background-color:#f9f9f9} .no-print{display:none;} @media print { body { margin: 1cm; } h1 { page-break-before: auto; } table { page-break-inside: auto; } tr { page-break-inside: avoid; page-break-after: auto; } thead { display: table-header-group; } tfoot { display: table-footer-group; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>${printTitle}</h1>`);
        if(reportState.data?.referencePerson) {
            printWindow.document.write(`<h3>Reference: ${reportState.data.referencePerson}</h3>`);
        }
        printWindow.document.write(reportTableRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
      }
    } else {
      toast({ title: "Print Error", description: "No report content to print.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4 p-4 border rounded-md bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="hospitalId">Hospital <span className="text-destructive">*</span></Label>
            <Controller
              name="hospitalId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={availableHospitals.length === 0}>
                  <SelectTrigger id="hospitalId">
                    <SelectValue placeholder="Select Hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHospitals.map(hospital => (
                      <SelectItem key={hospital.value} value={hospital.value}>{hospital.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {formErrors.hospitalId && <p className="text-sm text-destructive mt-1">{formErrors.hospitalId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="dateFrom">Date From <span className="text-destructive">*</span></Label>
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
          <div className="space-y-1">
            <Label htmlFor="dateTo">Date To <span className="text-destructive">*</span></Label>
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
        </div>
        {formErrors.root && <p className="text-sm text-destructive mt-1 text-center">{formErrors.root.message}</p>}
        <div className="flex justify-end pt-2">
          <SubmitButton />
        </div>
      </form>

      {reportState?.errors && reportState.errors.length > 0 && !reportState.success && (
        <Alert variant="destructive">
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

      {reportState.success && reportState.data && (
        <div className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handlePrint} variant="outline" disabled={!reportState.data.entries.length}>
              <Printer className="mr-2 h-4 w-4" /> Print Report
            </Button>
          </div>
          <HospitalBillTable reportData={reportState.data} ref={reportTableRef} />
        </div>
      )}
      {reportState.success && !reportState.data?.entries?.length && (
         <Alert variant="default" className="mt-6 bg-blue-50 border-blue-200 text-blue-700">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            {reportState.message || "No billable entries found for the selected criteria."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

    