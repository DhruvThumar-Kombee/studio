
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ServiceSchema, type ServiceFormInput, type ActionResponse } from '@/lib/schemas/serviceSchemas';
import { createServiceAction, updateServiceAction } from '@/actions/serviceMasterActions';
import type { Service, PriceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ServiceFormProps {
  service?: Service; 
}

export function ServiceForm({ service: existingService }: ServiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultSlabValues = { basePrice: 0, baseLimit: 0, additionalPricePerSlab: 0, slabSize: 1 };

  const { control, handleSubmit, watch, formState: { errors }, register, setValue, reset } = useForm<ServiceFormInput>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: existingService ? {
      ...existingService,
      fixedPrice: existingService.priceType === 'Fixed' ? existingService.fixedPrice : undefined,
      slabs: existingService.priceType === 'Slab-Based' ? (existingService.slabs || defaultSlabValues) : undefined,
    } : {
      name: '',
      priceType: 'Fixed',
      fixedPrice: 0,
      slabs: undefined, 
      isActive: true,
    },
  });

  const priceType = watch('priceType');
  const watchedIsActive = watch('isActive');

  React.useEffect(() => {
    // Effect to manage conditional clearing of fields when priceType changes
    if (priceType === 'Fixed') {
      setValue('slabs', undefined);
      // If fixedPrice is undefined (e.g. when switching from slab), set a default
      if (control._formValues.fixedPrice === undefined) {
        setValue('fixedPrice', 0);
      }
    } else if (priceType === 'Slab-Based') {
      setValue('fixedPrice', undefined);
      // If slabs is undefined (e.g. when switching from fixed), set default slab values
       if (control._formValues.slabs === undefined) {
        setValue('slabs', defaultSlabValues);
      }
    }
  }, [priceType, setValue, control._formValues]);
  
  React.useEffect(() => {
    // Reset form when existingService prop changes (e.g., navigating from new to edit)
    if (existingService) {
         reset({
            ...existingService,
            fixedPrice: existingService.priceType === 'Fixed' ? existingService.fixedPrice : undefined,
            slabs: existingService.priceType === 'Slab-Based' ? (existingService.slabs || defaultSlabValues) : undefined,
        });
    } else {
        reset({
            name: '',
            priceType: 'Fixed',
            fixedPrice: 0,
            slabs: undefined,
            isActive: true,
        });
    }
  }, [existingService, reset]);


  const onSubmit = async (data: ServiceFormInput) => {
    setIsSubmitting(true);
    let response: ActionResponse<Service>;

    // Ensure only relevant pricing data is sent based on priceType
    const payload: ServiceFormInput = { ...data };
    if (data.priceType === 'Fixed') {
      payload.slabs = undefined;
    } else if (data.priceType === 'Slab-Based') {
      payload.fixedPrice = undefined;
      if (!payload.slabs) payload.slabs = defaultSlabValues; // Ensure slabs object exists if type is Slab-Based
    }


    if (existingService?.id) {
      response = await updateServiceAction(existingService.id, payload);
    } else {
      response = await createServiceAction(payload);
    }

    setIsSubmitting(false);

    if (response.success) {
      toast({ title: "Success", description: response.message });
      router.push('/dashboard/admin/services');
      router.refresh(); 
    } else {
      let errorDescription = response.message || "An unknown error occurred.";
      if (response.errors) {
        const errorMessages = response.errors.map(err => `${err.path.join(' -> ')}: ${err.message}`).join('; ');
        errorDescription = `${response.message} Details: ${errorMessages}`;
      }
      toast({
        title: "Error Saving Service",
        description: errorDescription,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{existingService ? 'Edit Service' : 'Add New Service'}</CardTitle>
        <CardDescription>
          {existingService ? 'Update the details of the existing service.' : 'Fill in the details for the new service.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name <span className="text-destructive">*</span></Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Price Type <span className="text-destructive">*</span></Label>
            <Controller
              name="priceType"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => field.onChange(value as PriceType)}
                  value={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Fixed" id="priceTypeFixed" />
                    <Label htmlFor="priceTypeFixed" className="font-normal">Fixed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Slab-Based" id="priceTypeSlab" />
                    <Label htmlFor="priceTypeSlab" className="font-normal">Slab-Based</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.priceType && <p className="text-sm text-destructive mt-1">{errors.priceType.message}</p>}
          </div>

          {priceType === 'Fixed' && (
            <div className="space-y-2">
              <Label htmlFor="fixedPrice">Fixed Price (₹) <span className="text-destructive">*</span></Label>
              <Input id="fixedPrice" type="number" {...register('fixedPrice', { valueAsNumber: true, min: 0 })} step="any" />
              {errors.fixedPrice && <p className="text-sm text-destructive mt-1">{errors.fixedPrice.message}</p>}
            </div>
          )}

          {priceType === 'Slab-Based' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <h4 className="font-medium text-md">Slab Pricing Details <span className="text-destructive">*</span></h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="slabs.basePrice">Base Price (₹)</Label>
                  <Input id="slabs.basePrice" type="number" {...register('slabs.basePrice', { valueAsNumber: true, min: 0 })} step="any" />
                  {errors.slabs?.basePrice && <p className="text-sm text-destructive mt-1">{errors.slabs.basePrice.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slabs.baseLimit">Base Limit (₹)</Label>
                  <Input id="slabs.baseLimit" type="number" {...register('slabs.baseLimit', { valueAsNumber: true, min: 0 })} step="any" />
                  {errors.slabs?.baseLimit && <p className="text-sm text-destructive mt-1">{errors.slabs.baseLimit.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slabs.additionalPricePerSlab">Additional Price per Slab (₹)</Label>
                  <Input id="slabs.additionalPricePerSlab" type="number" {...register('slabs.additionalPricePerSlab', { valueAsNumber: true, min: 0 })} step="any" />
                  {errors.slabs?.additionalPricePerSlab && <p className="text-sm text-destructive mt-1">{errors.slabs.additionalPricePerSlab.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slabs.slabSize">Slab Size (₹)</Label>
                  <Input id="slabs.slabSize" type="number" {...register('slabs.slabSize', { valueAsNumber: true, min: 1 })} step="any" />
                  {errors.slabs?.slabSize && <p className="text-sm text-destructive mt-1">{errors.slabs.slabSize.message}</p>}
                </div>
              </div>
              {errors.slabs && !errors.slabs.basePrice && !errors.slabs.baseLimit && !errors.slabs.additionalPricePerSlab && !errors.slabs.slabSize && errors.slabs.message && (
                <p className="text-sm text-destructive mt-1">{errors.slabs.message as string}</p>
              )}
            </div>
          )}
           {errors.root?.message && <p className="text-sm text-destructive mt-1 text-center">{errors.root.message}</p>}
           
          {existingService && ( 
            <div className="space-y-2 flex items-center pt-2">
              <Controller
                name="isActive"
                control={control}
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
                Service is {watchedIsActive ? 'Active' : 'Inactive'}
              </Label>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between gap-2 pt-6">
          <Link href="/dashboard/admin/services" passHref>
            <Button type="button" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {existingService ? 'Save Changes' : 'Create Service'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
