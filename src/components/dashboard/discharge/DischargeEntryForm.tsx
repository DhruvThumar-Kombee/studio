
"use client";

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DischargeEntrySchema, type DischargeEntryFormInput } from '@/lib/schemas/dischargeSchemas';
import { createDischargeEntryAction } from '@/actions/dischargeActions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, UploadCloud, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added AlertTitle

const initialState: { success: boolean, message?: string, data?: any, errors?: any[] } = { success: false, message: "", data: null, errors: [] };


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Submit Discharge Entry
    </Button>
  );
}

export function DischargeEntryForm() {
  const [state, formAction] = useFormState(createDischargeEntryAction, initialState);
  const { toast } = useToast();
  const [fileList, setFileList] = React.useState<FileList | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { control, handleSubmit, register, formState: { errors: formErrors }, reset, watch, setValue } = useForm<DischargeEntryFormInput>({
    resolver: zodResolver(DischargeEntrySchema),
    defaultValues: {
      admissionId: '',
      billGenerated: undefined,
      finalBillAmount: undefined,
      documents: [], 
    },
     mode: 'onBlur', // Validate on blur to catch errors earlier
  });

  const watchedBillGenerated = watch('billGenerated');

  React.useEffect(() => {
    if (state.success && state.data) {
      toast({ title: "Success", description: state.message || "Discharge entry created!" });
      reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFileList(null);
    } else if (!state.success && state.message) {
        let description = state.message;
        if (state.errors && state.errors.length > 0) {
            const errorDetails = state.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
            description = `${state.message} ${errorDetails}`;
        }
         toast({
            title: "Submission Error",
            description: description,
            variant: "destructive",
            duration: 7000,
        });
    }
  }, [state, toast, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setFileList(files);
    // For react-hook-form and Zod, we need to pass an array of File objects.
    // However, for FormData submission, the native FileList from input is fine.
    // The server action will construct the array of Files from FormData.
    // We can still set the RHF value for client-side validation feedback if desired.
    if (files && files.length > 0) {
      setValue('documents', Array.from(files), { shouldValidate: true });
    } else {
      // If no files selected or selection is cleared
      setValue('documents', [], { shouldValidate: true });
    }
  };

  // This function is called by react-hook-form's handleSubmit
  // It ensures client-side validation passes before creating FormData
  const onValidSubmit = (data: DischargeEntryFormInput) => {
    const formData = new FormData();
    formData.append('admissionId', data.admissionId);
    
    if (data.billGenerated) { // This is an enum 'yes'|'no', so it will always be present if valid
        formData.append('billGenerated', data.billGenerated);
    }

    if (data.billGenerated === 'yes' && data.finalBillAmount !== undefined) {
      formData.append('finalBillAmount', String(data.finalBillAmount));
    }
    
    // Append files from the fileList state, as RHF's 'documents' might not be what FormData needs directly
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        formData.append(`documents[${i}]`, fileList[i]);
      }
    }
    formAction(formData); // Call the server action with FormData
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">New Discharge Entry</CardTitle>
        <CardDescription>Enter discharge details and upload necessary documents. Fields marked with <span className="text-destructive">*</span> are required.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onValidSubmit)}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-1">
            <Label htmlFor="admissionId">Admission ID <span className="text-destructive">*</span></Label>
            <Input 
              id="admissionId" 
              {...register('admissionId')} 
              placeholder="Enter ID of the admission" 
              className={formErrors.admissionId ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {formErrors.admissionId && <p className="text-sm text-destructive mt-1">{formErrors.admissionId.message}</p>}
          </div>

          <fieldset className="space-y-3 p-4 border rounded-md">
            <legend className="text-md font-semibold px-1">Billing Information</legend>
            <div className="space-y-1">
              <Label>Bill Generated? <span className="text-destructive">*</span></Label>
              <Controller
                name="billGenerated"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col sm:flex-row gap-4 pt-2"
                  >
                    {(['yes', 'no'] as const).map(val => (
                      <div key={val} className="flex items-center space-x-2">
                        <RadioGroupItem value={val} id={`billGenerated${val}`} />
                        <Label htmlFor={`billGenerated${val}`} className="font-normal capitalize">{val}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {formErrors.billGenerated && <p className="text-sm text-destructive mt-1">{formErrors.billGenerated.message}</p>}
            </div>

            {watchedBillGenerated === 'yes' && (
              <div className="space-y-1 animate-in fade-in duration-300">
                <Label htmlFor="finalBillAmount">Final Bill Amount (₹) <span className="text-destructive">*</span></Label>
                <Input 
                  id="finalBillAmount" 
                  type="number" 
                  {...register('finalBillAmount')} 
                  placeholder="e.g., 50000.00"
                  step="0.01" 
                  className={formErrors.finalBillAmount ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {formErrors.finalBillAmount && <p className="text-sm text-destructive mt-1">{formErrors.finalBillAmount.message}</p>}
              </div>
            )}
          </fieldset>
          
          <fieldset className="space-y-4 p-4 border rounded-md">
            <legend className="text-md font-semibold px-1">Document Upload <span className="text-destructive">*</span></legend>
             <Alert variant="default" className="bg-accent/10 border-accent/50">
              <UploadCloud className="h-5 w-5 text-accent" />
              <AlertDescription className="text-accent-foreground/90">
                At least one document is required. Supported: PDF, JPG, PNG. Max 10 files, 5MB each.
              </AlertDescription>
            </Alert>
            <div className="space-y-1">
              <Label htmlFor="documents-upload">Upload Discharge Documents</Label>
              <Input 
                id="documents-upload" // Changed ID to avoid conflict with RHF register name
                type="file" 
                multiple 
                onChange={handleFileChange} // Use direct handler for FileList
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                className={cn("block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20", formErrors.documents ? 'border-destructive focus-visible:ring-destructive' : '')}
              />
              {fileList && fileList.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Selected: {Array.from(fileList).map(f => f.name).join(', ')} ({fileList.length} file(s))
                </div>
              )}
              {formErrors.documents && <p className="text-sm text-destructive mt-1">{formErrors.documents.message}</p>}
            </div>
          </fieldset>

          {/* Display server-side action errors if any */}
          {state && !state.success && state.message && state.errors && state.errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Submission Error</AlertTitle>
              <AlertDescription>
                {state.message}
                <ul className="list-disc list-inside text-xs mt-1">
                  {state.errors.map((err: any, index: number) => (
                    <li key={index}>{`${err.path.join('.')} : ${err.message}`}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
           {formErrors.root && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Form Error</AlertTitle>
                <AlertDescription>{formErrors.root.message}</AlertDescription>
            </Alert>
            )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-8">
           <Button type="button" variant="outline" onClick={() => { 
               reset(); 
               if(fileInputRef.current) fileInputRef.current.value = ""; 
               setFileList(null); 
            }} className="w-full sm:w-auto">
            Clear Form
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
