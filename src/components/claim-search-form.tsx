
"use client";

import * as React from 'react';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2, Search, X, FileText } from 'lucide-react';
import type { ClaimStatus, SearchFormValues } from '@/types';
import { isAlpha, isAlphaNumeric, isNumeric } from '@/lib/validators';
import { ClaimStatusBadge } from './claim-status-badge';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { hospitals } from '@/lib/mock-data';
import { mockApiSearch } from '@/services/claimService';

const searchSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital selection is required.'),
  claimNumber: z.string().optional().refine(val => val ? isNumeric(val) : true, {
    message: 'Claim Number must be numeric.',
  }),
  policyNumber: z.string().optional().refine(val => val ? isAlphaNumeric(val) : true, {
    message: 'Policy Number must be alphanumeric.',
  }),
  patientName: z.string().optional().refine(val => val ? isAlpha(val) : true, {
    message: 'Patient Name must contain only letters and spaces.',
  }),
}).refine(data => !!data.claimNumber || !!data.policyNumber || !!data.patientName, {
  message: 'Please fill at least one identifier: Claim No, Policy No, or Patient Name.',
  path: ['root'], 
});

export function ClaimSearchForm() {
  const [searchResults, setSearchResults] = React.useState<ClaimStatus | null | 'not-found'>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [comboboxOpen, setComboboxOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      hospitalId: '',
      claimNumber: '',
      policyNumber: '',
      patientName: '',
    },
    mode: 'onChange', 
  });

  const { control, handleSubmit, reset, watch, formState, clearErrors } = form;
  const { errors } = formState;

  const hospitalIdValue = watch('hospitalId');
  const claimNumberValue = watch('claimNumber');
  const policyNumberValue = watch('policyNumber');
  const patientNameValue = watch('patientName');

  const isAnyIdentifierFilled = !!claimNumberValue || !!policyNumberValue || !!patientNameValue;
  
  const onSubmit = async (data: SearchFormValues) => {
    setIsLoading(true);
    setSearchResults(null);
    try {
      const result = await mockApiSearch({
        hospitalId: data.hospitalId,
        claimNumber: data.claimNumber || undefined,
        policyNumber: data.policyNumber || undefined,
        patientName: data.patientName || undefined,
      });
      setSearchResults(result ? {
        ...result,
        claimNumber: result.claimNumber || data.claimNumber,
        policyNumber: result.policyNumber || data.policyNumber,
        patientName: result.patientName || data.patientName,
      } : 'not-found');
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults('not-found'); 
      toast({
        title: "Search Error",
        description: "An unexpected error occurred during the search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (formErrors: FieldErrors<SearchFormValues>) => {
    if (formErrors.root?.message === 'Please fill at least one identifier: Claim No, Policy No, or Patient Name.') {
      toast({
        title: "Missing Information",
        description: formErrors.root.message,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    reset({
      hospitalId: '',
      claimNumber: '',
      policyNumber: '',
      patientName: '',
    });
    setSearchResults(null);
    setIsLoading(false);
    clearErrors();
  };
  
  const isSearchDisabled = isLoading || !hospitalIdValue || !isAnyIdentifierFilled || Object.keys(errors).length > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl md:text-3xl font-headline text-primary">Claim Status Search</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Find the status of your claim using the form below.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="hospitalId" className="font-medium text-foreground">Hospital Name <span className="text-destructive">*</span></Label>
            <Controller
              name="hospitalId"
              control={control}
              render={({ field }) => (
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      aria-label="Select hospital"
                      className={cn(
                        "w-full justify-between font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? hospitals.find(h => h.id === field.value)?.name
                        : 'Select hospital'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search hospital..." />
                      <CommandList>
                        <CommandEmpty>No hospital found.</CommandEmpty>
                        <CommandGroup>
                          {hospitals.map(hospital => (
                            <CommandItem
                              key={hospital.id}
                              value={hospital.name}
                              onSelect={() => {
                                field.onChange(hospital.id);
                                setComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === hospital.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {hospital.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.hospitalId && <p className="text-sm text-destructive mt-1">{errors.hospitalId.message}</p>}
          </div>

          <p className="text-sm text-muted-foreground text-center">Please provide at least one of the following identifiers:</p>
          
          <div className="space-y-2">
            <Label htmlFor="claimNumber" className="font-medium text-foreground">Claim Number</Label>
            <Controller
              name="claimNumber"
              control={control}
              render={({ field }) => (
                <Input 
                  id="claimNumber" 
                  placeholder="e.g., 123456789" 
                  {...field} 
                  type="tel" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-describedby="claimNumberError"
                />
              )}
            />
            {errors.claimNumber && <p id="claimNumberError" className="text-sm text-destructive mt-1">{errors.claimNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyNumber" className="font-medium text-foreground">Policy Number</Label>
            <Controller
              name="policyNumber"
              control={control}
              render={({ field }) => (
                <Input 
                  id="policyNumber" 
                  placeholder="e.g., ABC123XYZ" 
                  {...field} 
                  aria-describedby="policyNumberError"
                />
              )}
            />
            {errors.policyNumber && <p id="policyNumberError" className="text-sm text-destructive mt-1">{errors.policyNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientName" className="font-medium text-foreground">Patient Name</Label>
            <Controller
              name="patientName"
              control={control}
              render={({ field }) => (
                <Input 
                  id="patientName" 
                  placeholder="e.g., John Doe" 
                  {...field} 
                  aria-describedby="patientNameError"
                />
              )}
            />
            {errors.patientName && <p id="patientNameError" className="text-sm text-destructive mt-1">{errors.patientName.message}</p>}
          </div>
          
          {errors.root?.message && <p className="text-sm text-destructive mt-1 text-center">{errors.root.message}</p>}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 p-6">
          <Button type="submit" className="w-full sm:w-auto" disabled={isSearchDisabled}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardFooter>
      </form>

      {isLoading && (
        <div className="p-6 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Searching for claims...</p>
        </div>
      )}

      {!isLoading && searchResults && searchResults !== 'not-found' && (
        <div className="p-6">
          <ClaimStatusBadge status={searchResults} />
        </div>
      )}

      {!isLoading && searchResults === 'not-found' && (
        <div className="p-6 text-center">
          <Card className="border-dashed border-2 p-8">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">No Record Found</p>
            <p className="text-sm text-muted-foreground">
              We couldn't find any claim matching your criteria. Please check your inputs or try different search terms.
            </p>
          </Card>
        </div>
      )}
    </Card>
  );
}
