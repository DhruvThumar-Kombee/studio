
"use client";

import * as React from 'react';
import { useActionState, useFormStatus } from 'react-dom'; // useFormStatus is correct
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientAdmissionSchema, type PatientAdmissionFormInput } from '@/lib/schemas/admissionSchemas';
import type { TPA, SelectOption, Gender } from '@/types';
import { createPatientAdmissionAction } from '@/actions/admissionActions';
import { getTPAsAction } from '@/actions/tpaMasterActions'; // Assuming this can be called by staff

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker'; // Ensure this path is correct
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Download, AlertCircle, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const initialState = { success: false, message: "", data: null, errors: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Submit Admission
    </Button>
  );
}

export function PatientAdmissionForm() {
  const [state, formAction] = React.useActionState(createPatientAdmissionAction, initialState);
  const { toast } = useToast();
  const [tpas, setTpas] = React.useState<SelectOption[]>([]);
  const [fileList, setFileList] = React.useState<FileList | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { control, handleSubmit, register, formState: { errors: formErrors }, reset, setValue } = useForm<PatientAdmissionFormInput>({
    resolver: zodResolver(PatientAdmissionSchema),
    defaultValues: {
      patientName: '',
      patientAge: undefined, // Or provide a sensible default like 0 or null if schema allows
      patientGender: undefined,
      patientContact: '',
      tpaId: '',
      admissionDate: undefined,
      documents: undefined, // Will be handled via FormData
    },
  });

  React.useEffect(() => {
    async function fetchTPAs() {
      try {
        const tpaData = await getTPAsAction();
        setTpas(tpaData.filter(tpa => tpa.isActive).map(tpa => ({ value: tpa.id, label: tpa.name })));
      } catch (error) {
        toast({ title: "Error", description: "Failed to load TPAs.", variant: "destructive" });
      }
    }
    fetchTPAs();
  }, [toast]);

  React.useEffect(() => {
    if (state.success) {
      toast({ title: "Success", description: state.message });
      reset(); // Reset form fields
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
      }
      setFileList(null);
    } else if (state.message && !state.success && state.errors) {
        // Form-level errors from server action
         const serverErrors = state.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
         toast({
            title: "Error Submitting Admission",
            description: `${state.message} Details: ${serverErrors || 'Please check your input.'}`,
            variant: "destructive",
            duration: 7000,
        });
    } else if (state.message && !state.success) {
        toast({
            title: "Error",
            description: state.message,
            variant: "destructive",
        });
    }
  }, [state, toast, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileList(event.target.files);
  };

  // This wrapper is needed because server actions with useFormState
  // don't integrate directly with react-hook-form's handleSubmit validation.
  // We use handleSubmit for client-side validation, then pass to the action.
  const onValidSubmit = (data: PatientAdmissionFormInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (key === "admissionDate" && value instanceof Date) {
            formData.append(key, value.toISOString());
        } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });

    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        formData.append(`documents[${i}]`, fileList[i]);
      }
    }
    formAction(formData);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>New Patient Admission</CardTitle>
        <CardDescription>Enter patient and admission details. Fields marked with * are required.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onValidSubmit)}>
        <CardContent className="space-y-6">
          {/* Patient Info Section */}
          <fieldset className="space-y-4 p-4 border rounded-md">
            <legend className="text-lg font-medium px-1">Patient Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="patientName">Patient Name <span className="text-destructive">*</span></Label>
                <Input id="patientName" {...register('patientName')} />
                {formErrors.patientName && <p className="text-sm text-destructive mt-1">{formErrors.patientName.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="patientAge">Age <span className="text-destructive">*</span></Label>
                <Input id="patientAge" type="number" {...register('patientAge', { valueAsNumber: true })} />
                {formErrors.patientAge && <p className="text-sm text-destructive mt-1">{formErrors.patientAge.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Gender <span className="text-destructive">*</span></Label>
                <Controller
                  name="patientGender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4 pt-2"
                    >
                      {(['Male', 'Female', 'Other'] as Gender[]).map(g => (
                        <div key={g} className="flex items-center space-x-2">
                          <RadioGroupItem value={g} id={`gender${g}`} />
                          <Label htmlFor={`gender${g}`} className="font-normal">{g}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                {formErrors.patientGender && <p className="text-sm text-destructive mt-1">{formErrors.patientGender.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="patientContact">Contact Number <span className="text-destructive">*</span></Label>
                <Input id="patientContact" {...register('patientContact')} />
                {formErrors.patientContact && <p className="text-sm text-destructive mt-1">{formErrors.patientContact.message}</p>}
              </div>
            </div>
          </fieldset>

          {/* Admission Details Section */}
          <fieldset className="space-y-4 p-4 border rounded-md">
            <legend className="text-lg font-medium px-1">Admission Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="tpaId">TPA <span className="text-destructive">*</span></Label>
                    <Controller
                        name="tpaId"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={tpas.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select TPA" />
                            </SelectTrigger>
                            <SelectContent>
                                {tpas.map(tpa => (
                                <SelectItem key={tpa.value} value={tpa.value}>{tpa.label}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        )}
                    />
                    {tpas.length === 0 && <p className="text-sm text-muted-foreground mt-1">Loading TPAs or none available.</p>}
                    {formErrors.tpaId && <p className="text-sm text-destructive mt-1">{formErrors.tpaId.message}</p>}
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="admissionDate">Admission Date <span className="text-destructive">*</span></Label>
                    <Controller
                        name="admissionDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker 
                                date={field.value} 
                                setDate={field.onChange}
                                placeholder="Select admission date"
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            />
                        )}
                    />
                    {formErrors.admissionDate && <p className="text-sm text-destructive mt-1">{formErrors.admissionDate.message}</p>}
                </div>
            </div>
          </fieldset>
          
          {/* Document Upload Section */}
          <fieldset className="space-y-4 p-4 border rounded-md">
            <legend className="text-lg font-medium px-1">Document Upload</legend>
             <Alert variant="default" className="bg-accent/30">
              <UploadCloud className="h-4 w-4" />
              <AlertDescription>
                Multi-file upload (PDF, JPG, PNG). Max 10 files, 5MB each. (Full validation coming soon)
              </AlertDescription>
            </Alert>
            <div className="space-y-1">
              <Label htmlFor="documents">Upload Documents</Label>
              <Input 
                id="documents" 
                type="file" 
                multiple 
                {...register('documents')} // RHF handles this for FormData
                onChange={handleFileChange}
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {fileList && fileList.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Selected files: {Array.from(fileList).map(f => f.name).join(', ')}
                </div>
              )}
              {formErrors.documents && <p className="text-sm text-destructive mt-1">{formErrors.documents.message}</p>}
            </div>
             <Button type="button" variant="outline" size="sm" disabled> {/* Placeholder */}
                <Download className="mr-2 h-4 w-4" /> Download Excel Template
            </Button>
          </fieldset>

          {/* Server-side form error display */}
          {state?.errors && !state.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {state.message || "An error occurred."}
                <ul>
                  {state.errors.map((err: any, index: number) => (
                    <li key={index}>{`${err.path.join('.')} : ${err.message}`}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-6">
           <Button type="button" variant="outline" onClick={() => { reset(); if(fileInputRef.current) fileInputRef.current.value = ""; setFileList(null); }} className="w-full sm:w-auto">
            Clear Form
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}

