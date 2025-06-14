"use client";

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientAdmissionSchema, type PatientAdmissionFormInput } from '@/lib/schemas/admissionSchemas';
import type { TPA, Service, SelectOption, Gender } from '@/types'; // Added Service
import { createPatientAdmissionAction } from '@/actions/admissionActions';
import { getTPAsAction } from '@/actions/tpaMasterActions';
import { getServicesForSelectAction } from '@/actions/hospitalActions'; // Using this to fetch services
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
import type { PatientAdmission } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select'; // Added MultiSelect
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Download, AlertCircle, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const initialState: ActionResponse<PatientAdmission> = { success: false, message: "" };

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
  const [state, formAction] = useActionState(createPatientAdmissionAction, initialState);
  const { toast } = useToast();
  const [tpas, setTpas] = React.useState<SelectOption[]>([]);
  const [services, setServices] = React.useState<SelectOption[]>([]);
  const [fileList, setFileList] = React.useState<FileList | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { control, handleSubmit, register, formState: { errors: formErrors }, reset, setValue } = useForm<PatientAdmissionFormInput>({
    resolver: zodResolver(PatientAdmissionSchema),
    defaultValues: {
      patientName: '',
      patientAge: undefined,
      patientGender: undefined,
      patientContact: '',
      tpaId: '',
      admissionDate: undefined,
      associatedServiceIds: [], // Initialize
      documents: [], // Initialize
    },
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        const tpaData = await getTPAsAction();
        setTpas(tpaData.filter(tpa => tpa.isActive).map(tpa => ({ value: tpa.id, label: tpa.name })));
        
        const serviceData = await getServicesForSelectAction(); // Fetching all active services
        setServices(serviceData.map(service => ({ value: service.id, label: service.name })));

      } catch (error) {
        toast({ title: "Error", description: "Failed to load TPAs or Services.", variant: "destructive" });
      }
    }
    fetchData();
  }, [toast]);

  React.useEffect(() => {
    if (state.success && state.data?.id) { // Check for data.id for the toast message
      toast({ title: "Success", description: state.message }); // Message already contains the ID
      reset(); 
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
      setFileList(null);
    } else if (state.message && !state.success && state.errors) {
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
    const files = event.target.files;
    setFileList(files);
    if (files && files.length > 0) {
      setValue('documents', Array.from(files), { shouldValidate: true });
    } else {
      setValue('documents', [], { shouldValidate: true });
    }
  };
  
  const onValidSubmit = (data: PatientAdmissionFormInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (key === "admissionDate" && value instanceof Date) {
            formData.append(key, value.toISOString());
        } else if (key === "associatedServiceIds" && Array.isArray(value)) {
            value.forEach(serviceId => formData.append(key, serviceId));
        } else if (key === "documents") {
            // Files are handled by fileList below
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
                <Input id="patientName" {...register('patientName')} className={formErrors.patientName ? 'border-destructive focus-visible:ring-destructive' : ''} />
                {formErrors.patientName && <p className="text-sm text-destructive mt-1">{formErrors.patientName.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="patientAge">Age <span className="text-destructive">*</span></Label>
                <Input id="patientAge" type="number" {...register('patientAge', { valueAsNumber: true })} className={formErrors.patientAge ? 'border-destructive focus-visible:ring-destructive' : ''} />
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
                <Input id="patientContact" {...register('patientContact')} className={formErrors.patientContact ? 'border-destructive focus-visible:ring-destructive' : ''} />
                {formErrors.patientContact && <p className="text-sm text-destructive mt-1">{formErrors.patientContact.message}</p>}
              </div>
            </div>
          </fieldset>

          {/* Admission Details Section */}
          <fieldset className="space-y-4 p-4 border rounded-md">
            <legend className="text-lg font-medium px-1">Admission & Service Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="tpaId">TPA <span className="text-destructive">*</span></Label>
                    <Controller
                        name="tpaId"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={tpas.length === 0}>
                            <SelectTrigger className={formErrors.tpaId ? 'border-destructive focus-visible:ring-destructive' : ''}>
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
                                className={formErrors.admissionDate ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                        )}
                    />
                    {formErrors.admissionDate && <p className="text-sm text-destructive mt-1">{formErrors.admissionDate.message}</p>}
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="associatedServiceIds">Associated Services <span className="text-destructive">*</span></Label>
                <Controller
                    name="associatedServiceIds"
                    control={control}
                    render={({ field }) => (
                        <MultiSelect
                            options={services}
                            selectedValues={field.value || []}
                            onSelectedValuesChange={field.onChange}
                            placeholder="Select services..."
                            disabled={services.length === 0}
                            className={formErrors.associatedServiceIds ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                    )}
                />
                {services.length === 0 && <p className="text-sm text-muted-foreground mt-1">Loading services or none available.</p>}
                {formErrors.associatedServiceIds && <p className="text-sm text-destructive mt-1">{formErrors.associatedServiceIds.message}</p>}
            </div>
          </fieldset>
          
          {/* Document Upload Section */}
          <fieldset className="space-y-4 p-4 border rounded-md">
            <legend className="text-lg font-medium px-1">Document Upload <span className="text-destructive">*</span></legend>
             <Alert variant="default" className="bg-accent/10 border-accent/50">
              <UploadCloud className="h-5 w-5 text-accent" />
              <AlertDescription className="text-accent-foreground/90">
                At least one document required. PDF, JPG, PNG. Max 10 files, 5MB each.
              </AlertDescription>
            </Alert>
            <div className="space-y-1">
              <Label htmlFor="documents-upload">Upload Admission Documents</Label>
              <Input 
                id="documents-upload" 
                type="file" 
                multiple 
                onChange={handleFileChange}
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
           {formErrors.root && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formErrors.root.message}</AlertDescription>
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
