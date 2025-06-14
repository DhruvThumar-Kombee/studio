'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionSchema, type TransactionFormInput } from '@/lib/schemas/transactionSchemas';
import type { Transaction, TransactionType } from '@/types';
import { createTransactionAction, updateTransactionAction } from '@/actions/transactionActions';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle as ShadAlertTitle, AlertDescription as ShadAlertDescription } from "@/components/ui/alert"; // Renamed to avoid conflict

interface TransactionFormProps {
  transaction?: Transaction | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFormSubmitSuccess: () => void; 
}

const initialActionState: ActionResponse<Transaction> = { success: false, message: "" };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {isEditing ? 'Save Changes' : 'Create Transaction'}
    </Button>
  );
}

export function TransactionForm({
  transaction: existingTransaction,
  isOpen,
  onOpenChange,
  onFormSubmitSuccess,
}: TransactionFormProps) {
  const { toast } = useToast();
  
  const action = existingTransaction?.id 
    ? updateTransactionAction.bind(null, existingTransaction.id) 
    : createTransactionAction;
  const [state, formAction] = useActionState(action, initialActionState);


  const defaultValues: TransactionFormInput = existingTransaction
    ? {
        ...existingTransaction,
        date: new Date(existingTransaction.date), // Ensure date is a Date object
      }
    : {
        type: 'Expense',
        date: new Date(),
        amount: 0,
        description: '',
        category: '',
      };

  const { control, handleSubmit, formState: { errors }, register, reset, watch } = useForm<TransactionFormInput>({
    resolver: zodResolver(TransactionSchema),
    defaultValues,
  });
  
  const transactionType = watch('type');

  React.useEffect(() => {
    if (isOpen) {
      reset(existingTransaction ? {
        ...existingTransaction,
        date: new Date(existingTransaction.date),
      } : {
        type: 'Expense',
        date: new Date(),
        amount: 0,
        description: '',
        category: '',
      });
    }
  }, [isOpen, existingTransaction, reset]);

  React.useEffect(() => {
    if(state.success){
        toast({ title: "Success", description: state.message });
        onFormSubmitSuccess(); 
        onOpenChange(false); 
    } else if (state.message && !state.success && state.errors) {
        const errorDetails = state.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
        toast({
            title: `Error ${existingTransaction ? 'Updating' : 'Creating'} Transaction`,
            description: `${state.message} Details: ${errorDetails}`,
            variant: "destructive",
            duration: 7000,
        });
    } else if (state.message && !state.success) {
         toast({
            title: `Error ${existingTransaction ? 'Updating' : 'Creating'} Transaction`,
            description: state.message,
            variant: "destructive",
        });
    }
  }, [state, toast, onFormSubmitSuccess, onOpenChange, existingTransaction]);


  const processForm = (data: TransactionFormInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'date' && value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formAction(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{existingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
          <DialogDescription>
            {existingTransaction ? 'Update transaction details.' : 'Fill in the details for the new transaction.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <form id={`transaction-form-${existingTransaction?.id || 'new'}`} onSubmit={handleSubmit(processForm)} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Type <span className="text-destructive">*</span></Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex space-x-4 pt-1"
                  >
                    {(['Expense', 'Income'] as TransactionType[]).map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type} id={`type-${type}-${existingTransaction?.id || 'new'}`} />
                        <Label htmlFor={`type-${type}-${existingTransaction?.id || 'new'}`} className="font-normal">{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor={`date-${existingTransaction?.id || 'new'}`}>Date <span className="text-destructive">*</span></Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker 
                      date={field.value} 
                      setDate={field.onChange}
                      placeholder="Select transaction date"
                      disabled={(d) => d > new Date()} // Cannot select future dates
                    />
                  )}
                />
                {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`amount-${existingTransaction?.id || 'new'}`}>Amount (₹) <span className="text-destructive">*</span></Label>
                <Input 
                  id={`amount-${existingTransaction?.id || 'new'}`} 
                  type="number" 
                  {...register('amount')} 
                  step="0.01"
                  placeholder="e.g., 1000.50"
                />
                {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor={`description-${existingTransaction?.id || 'new'}`}>Description <span className="text-destructive">*</span></Label>
              <Textarea 
                id={`description-${existingTransaction?.id || 'new'}`}
                {...register('description')} 
                placeholder="Enter a brief description of the transaction"
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor={`category-${existingTransaction?.id || 'new'}`}>Category (Optional)</Label>
              <Input 
                id={`category-${existingTransaction?.id || 'new'}`}
                {...register('category')} 
                placeholder="e.g., Utilities, Salary, Service Revenue"
              />
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
            </div>
            
            {state?.errors && !state.success && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <ShadAlertTitle>Error Processing Transaction</ShadAlertTitle>
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
          <SubmitButton isEditing={!!existingTransaction} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
