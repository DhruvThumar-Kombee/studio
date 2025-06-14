
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TPASchema, type TPAFormInput } from '@/lib/schemas/tpaSchemas';
import type { TPA } from '@/types';
import { createTPAAction, updateTPAAction } from '@/actions/tpaMasterActions';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface TPAFormProps {
  tpa?: TPA | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFormSubmitSuccess: () => void; 
}

export function TPAForm({
  tpa: existingTPA,
  isOpen,
  onOpenChange,
  onFormSubmitSuccess,
}: TPAFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: TPAFormInput = existingTPA
    ? {
        ...existingTPA,
        email: existingTPA.email || '',
        mobile: existingTPA.mobile || '',
        address: existingTPA.address || '',
      }
    : {
        name: '',
        address: '',
        email: '',
        mobile: '',
        isActive: true,
      };

  const { control, handleSubmit, formState: { errors }, register, reset } = useForm<TPAFormInput>({
    resolver: zodResolver(TPASchema),
    defaultValues,
  });

  const watchedIsActive = control.watch('isActive');

  React.useEffect(() => {
    if (isOpen) {
      reset(existingTPA ? {
        ...existingTPA,
        email: existingTPA.email || '',
        mobile: existingTPA.mobile || '',
        address: existingTPA.address || '',
      } : defaultValues);
    }
  }, [isOpen, existingTPA, reset, defaultValues]);


  const onSubmit = async (data: TPAFormInput) => {
    setIsSubmitting(true);
    let response: ActionResponse<TPA>;

    if (existingTPA?.id) {
      response = await updateTPAAction(existingTPA.id, data);
    } else {
      response = await createTPAAction(data);
    }
    setIsSubmitting(false);

    if (response.success) {
      toast({ title: "Success", description: response.message });
      onFormSubmitSuccess(); 
      onOpenChange(false); 
    } else {
      let errorDescription = response.message || "An unknown error occurred.";
      if (response.errors) {
        const errorMessages = response.errors.map(err => `${err.path.join(' -> ')}: ${err.message}`).join('; ');
        errorDescription = `${response.message} Details: ${errorMessages}`;
      }
      toast({
        title: `Error ${existingTPA ? 'Updating' : 'Creating'} TPA`,
        description: errorDescription,
        variant: "destructive",
        duration: 10000,
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{existingTPA ? 'Edit TPA' : 'Add New TPA'}</DialogTitle>
          <DialogDescription>
            {existingTPA ? 'Update the details of the existing TPA.' : 'Fill in the details for the new TPA.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <form id="tpa-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name">TPA Name <span className="text-destructive">*</span></Label>
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
            
            {errors.root?.message && <p className="text-sm text-destructive mt-1 text-center">{errors.root.message}</p>}

            {existingTPA && (
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
                  TPA is {watchedIsActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
           <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="tpa-form" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {existingTPA ? 'Save Changes' : 'Create TPA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
