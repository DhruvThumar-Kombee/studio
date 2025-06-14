
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HospitalSchema, type HospitalFormInput } from '@/lib/schemas/hospitalSchemas';
import type { Doctor, Service, CommissionType, HospitalDetails, SelectOption } from '@/types';
import { createHospitalAction, updateHospitalAction } from '@/actions/hospitalActions';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MultiSelect } from '@/components/ui/multi-select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface HospitalFormProps {
  hospital?: HospitalDetails | null;
  doctors: Doctor[];
  services: Service[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFormSubmitSuccess: () => void; // Callback after successful submission
}

export function HospitalForm({
  hospital: existingHospital,
  doctors,
  services,
  isOpen,
  onOpenChange,
  onFormSubmitSuccess,
}: HospitalFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const doctorOptions: SelectOption[] = doctors.map(doc => ({ value: doc.id, label: doc.name }));
  const serviceOptions: SelectOption[] = services.map(srv => ({ value: srv.id, label: srv.name }));

  const defaultValues: HospitalFormInput = React.useMemo(() => (
    existingHospital
    ? {
        ...existingHospital,
        email: existingHospital.email || '',
        mobile: existingHospital.mobile || '',
        address: existingHospital.address || '',
      }
    : {
        name: '',
        address: '',
        email: '',
        mobile: '',
        assignedDoctorIds: [],
        associatedServiceIds: [],
        reference: {
          name: '',
          mobile: '',
          commissionType: 'Fixed',
          commissionValue: 0,
        },
        isActive: true,
      }
  ), [existingHospital]);


  const { control, handleSubmit, watch, formState: { errors }, register, reset, setValue } = useForm<HospitalFormInput>({
    resolver: zodResolver(HospitalSchema),
    defaultValues,
  });

  const commissionType = watch('reference.commissionType');
  const watchedIsActive = watch('isActive');

  React.useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, defaultValues, reset]);


  const onSubmit = async (data: HospitalFormInput) => {
    setIsSubmitting(true);
    let response: ActionResponse<HospitalDetails> | undefined = undefined;

    try {
      if (existingHospital?.id) {
        response = await updateHospitalAction(existingHospital.id, data);
      } else {
        response = await createHospitalAction(data);
      }
    } catch (error) {
      console.error("Error during hospital action:", error);
      toast({
        title: "Action Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(false);

    if (response && response.success) {
      toast({ title: "Success", description: response.message });
      onFormSubmitSuccess(); 
      onOpenChange(false); 
    } else if (response) {
      let errorDescription = response.message || "An unknown error occurred.";
      if (response.errors) {
        const errorMessages = response.errors.map(err => `${err.path.join(' -> ')}: ${err.message}`).join('; ');
        errorDescription = `${response.message} Details: ${errorMessages}`;
      }
      toast({
        title: `Error ${existingHospital ? 'Updating' : 'Creating'} Hospital`,
        description: errorDescription,
        variant: "destructive",
        duration: 10000,
      });
    } else {
      toast({
        title: "Unexpected Issue",
        description: "The operation completed but the result is unclear. Please check the data or try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{existingHospital ? 'Edit Hospital' : 'Add New Hospital'}</DialogTitle>
          <DialogDescription>
            {existingHospital ? 'Update the details of the existing hospital.' : 'Fill in the details for the new hospital.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <form id="hospital-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name">Hospital Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
              {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" type="tel" {...register('mobile')} />
                {errors.mobile && <p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="assignedDoctorIds">Assigned Doctors</Label>
              <Controller
                name="assignedDoctorIds"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={doctorOptions}
                    selectedValues={field.value || []}
                    onSelectedValuesChange={field.onChange}
                    placeholder="Select doctors..."
                  />
                )}
              />
              {errors.assignedDoctorIds && <p className="text-sm text-destructive mt-1">{errors.assignedDoctorIds.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="associatedServiceIds">Associated Services</Label>
               <Controller
                name="associatedServiceIds"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={serviceOptions}
                    selectedValues={field.value || []}
                    onSelectedValuesChange={field.onChange}
                    placeholder="Select services..."
                  />
                )}
              />
              {errors.associatedServiceIds && <p className="text-sm text-destructive mt-1">{errors.associatedServiceIds.message}</p>}
            </div>

            <fieldset className="space-y-3 p-3 border rounded-md bg-muted/20">
              <legend className="text-sm font-medium px-1">Reference Details</legend>
              <div className="space-y-1">
                <Label htmlFor="reference.name">Reference Name <span className="text-destructive">*</span></Label>
                <Input id="reference.name" {...register('reference.name')} />
                {errors.reference?.name && <p className="text-sm text-destructive mt-1">{errors.reference.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="reference.mobile">Reference Mobile <span className="text-destructive">*</span></Label>
                <Input id="reference.mobile" {...register('reference.mobile')} />
                {errors.reference?.mobile && <p className="text-sm text-destructive mt-1">{errors.reference.mobile.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Commission Type <span className="text-destructive">*</span></Label>
                <Controller
                  name="reference.commissionType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value as CommissionType)}
                      value={field.value}
                      className="flex space-x-4 pt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Fixed" id="commissionTypeFixed" />
                        <Label htmlFor="commissionTypeFixed" className="font-normal">Fixed (₹)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Percentage" id="commissionTypePercentage" />
                        <Label htmlFor="commissionTypePercentage" className="font-normal">Percentage (%)</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.reference?.commissionType && <p className="text-sm text-destructive mt-1">{errors.reference.commissionType.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="reference.commissionValue">
                  Commission Value ({commissionType === 'Fixed' ? '₹' : '%'}) <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="reference.commissionValue" 
                  type="number" 
                  {...register('reference.commissionValue', { valueAsNumber: true })} 
                  step={commissionType === 'Percentage' ? "0.01" : "1"}
                />
                {errors.reference?.commissionValue && <p className="text-sm text-destructive mt-1">{errors.reference.commissionValue.message}</p>}
              </div>
               {errors.reference && !errors.reference.name && !errors.reference.mobile && !errors.reference.commissionType && !errors.reference.commissionValue && errors.reference.message && (
                <p className="text-sm text-destructive mt-1">{errors.reference.message as string}</p>
              )}
            </fieldset>
            
            {errors.root?.message && <p className="text-sm text-destructive mt-1 text-center">{errors.root.message}</p>}

            {existingHospital && (
              <div className="space-y-2 flex items-center pt-2">
                <Controller
                  name="isActive"
                  control={control}
                  defaultValue={true}
                  render={({ field }) => (
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mr-3"
                    />
                  )}
                />
                <Label htmlFor="isActive" className="font-normal">
                  Hospital is {watchedIsActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
           <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="hospital-form" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {existingHospital ? 'Save Changes' : 'Create Hospital'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

