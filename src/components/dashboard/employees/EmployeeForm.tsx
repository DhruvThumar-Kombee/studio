'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeSchema, type EmployeeFormInput } from '@/lib/schemas/employeeSchemas';
import type { Employee, EmployeeRole } from '@/types';
import { EmployeeRoles } from '@/types'; // Import the roles array
import { createEmployeeAction, updateEmployeeAction } from '@/actions/employeeActions';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle as ShadAlertTitle, AlertDescription as ShadAlertDescription } from "@/components/ui/alert";

interface EmployeeFormProps {
  employee?: Employee | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFormSubmitSuccess: () => void; 
}

const initialActionState: ActionResponse<Employee> = { success: false, message: "" };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {isEditing ? 'Save Changes' : 'Create Employee'}
    </Button>
  );
}

export function EmployeeForm({
  employee: existingEmployee,
  isOpen,
  onOpenChange,
  onFormSubmitSuccess,
}: EmployeeFormProps) {
  const { toast } = useToast();
  
  const action = existingEmployee?.id 
    ? updateEmployeeAction.bind(null, existingEmployee.id) 
    : createEmployeeAction;
  const [state, formAction] = useActionState(action, initialActionState);

  const defaultValues: EmployeeFormInput = existingEmployee
    ? {
        name: existingEmployee.name,
        role: existingEmployee.role,
        contact: existingEmployee.contact || '',
        isActive: existingEmployee.isActive,
      }
    : {
        name: '',
        role: EmployeeRoles[0], // Default to the first role
        contact: '',
        isActive: true,
      };

  const { control, handleSubmit, formState: { errors }, register, reset, watch } = useForm<EmployeeFormInput>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues,
  });
  
  const watchedIsActive = watch('isActive');

  React.useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, existingEmployee, reset, defaultValues]);

  React.useEffect(() => {
    if (state.success) {
        toast({ title: "Success", description: state.message });
        onFormSubmitSuccess(); 
        onOpenChange(false); 
    } else if (state.message && !state.success && state.errors) {
        const errorDetails = state.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
        toast({
            title: `Error ${existingEmployee ? 'Updating' : 'Creating'} Employee`,
            description: `${state.message} Details: ${errorDetails}`,
            variant: "destructive",
            duration: 7000,
        });
    } else if (state.message && !state.success) {
         toast({
            title: `Error ${existingEmployee ? 'Updating' : 'Creating'} Employee`,
            description: state.message,
            variant: "destructive",
        });
    }
  }, [state, toast, onFormSubmitSuccess, onOpenChange, existingEmployee]);

  const processForm = (data: EmployeeFormInput) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('role', data.role);
    if (data.contact) formData.append('contact', data.contact);
    if (existingEmployee) { // Only include isActive for updates
      formData.append('isActive', String(data.isActive));
    }
    formAction(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{existingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            {existingEmployee ? 'Update employee details.' : 'Fill in the details for the new employee.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <form id={`employee-form-${existingEmployee?.id || 'new'}`} onSubmit={handleSubmit(processForm)} className="space-y-4 py-4">
            
            <div className="space-y-1">
              <Label htmlFor={`name-${existingEmployee?.id || 'new'}`}>Full Name <span className="text-destructive">*</span></Label>
              <Input 
                id={`name-${existingEmployee?.id || 'new'}`} 
                {...register('name')} 
                placeholder="e.g., John Doe"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor={`role-${existingEmployee?.id || 'new'}`}>Role <span className="text-destructive">*</span></Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id={`role-${existingEmployee?.id || 'new'}`}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {EmployeeRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor={`contact-${existingEmployee?.id || 'new'}`}>Contact (Phone/Email)</Label>
              <Input 
                id={`contact-${existingEmployee?.id || 'new'}`}
                {...register('contact')} 
                placeholder="e.g., 9876543210 or john.doe@example.com"
              />
              {errors.contact && <p className="text-sm text-destructive mt-1">{errors.contact.message}</p>}
            </div>
            
            {existingEmployee && (
              <div className="space-y-2 flex items-center pt-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id={`isActive-${existingEmployee.id}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mr-3"
                    />
                  )}
                />
                <Label htmlFor={`isActive-${existingEmployee.id}`} className="font-normal">
                  Employee is {watchedIsActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            )}
            
            {state?.errors && !state.success && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <ShadAlertTitle>Error Processing Employee Data</ShadAlertTitle>
                <ShadAlertDescription>
                    {state.message || "An error occurred."}
                    <ul className="list-disc list-inside text-xs mt-1">
                    {state.errors.map((err: any, index: number) => (
                        <li key={index}>{`${err.path.join('.')} : ${err.message}`}</li>
                    ))}
                    </ul>
                </ShadAlertDescription>
                </Alert>
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
           <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <SubmitButton isEditing={!!existingEmployee} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
