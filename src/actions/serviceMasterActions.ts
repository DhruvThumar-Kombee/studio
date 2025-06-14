
'use server';

import { z } from 'zod';
import { 
  addService as addServiceAPI, 
  updateService as updateServiceAPI, 
  deleteService as deleteServiceAPI, 
  getAllServicesAdmin 
} from '@/services/serviceMasterService';
import type { Service, PriceType, ServiceSlab } from '@/types';
import { revalidatePath } from 'next/cache';

const slabSchema = z.object({
  basePrice: z.number({invalid_type_error: "Base price must be a number."}).min(0, "Base price must be non-negative."),
  baseLimit: z.number({invalid_type_error: "Base limit must be a number."}).min(0, "Base limit must be non-negative."),
  additionalPricePerSlab: z.number({invalid_type_error: "Additional price must be a number."}).min(0, "Additional price must be non-negative."),
  slabSize: z.number({invalid_type_error: "Slab size must be a number."}).positive("Slab size must be positive."),
});

export const ServiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Service name is required."),
  priceType: z.enum(['Fixed', 'Slab-Based'], { required_error: "Price type is required." }),
  fixedPrice: z.number({invalid_type_error: "Fixed price must be a number."}).min(0, "Fixed price must be non-negative.").optional(),
  slabs: slabSchema.optional(),
  isActive: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.priceType === 'Fixed') {
    if (data.fixedPrice === undefined || data.fixedPrice === null || data.fixedPrice < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fixed price is required and must be non-negative for Fixed price type.",
        path: ['fixedPrice'],
      });
    }
    // Ensure slabs is not present if fixed
    if (data.slabs !== undefined) {
        // This case should ideally be handled by form logic clearing out slabs when switching to Fixed.
        // If it still gets here, it's an issue. Forcing it to be undefined if type is Fixed.
    }
  } else if (data.priceType === 'Slab-Based') {
    if (!data.slabs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Slab details are required for Slab-Based price type.",
        path: ['slabs'], // Points to the object itself
      });
    }
     // Ensure fixedPrice is not present if slab-based
    if (data.fixedPrice !== undefined) {
        // Similar to above, form logic should clear fixedPrice.
    }
  }
});

export type ServiceFormInput = z.infer<typeof ServiceSchema>;

export interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: z.ZodIssue[]; // For field-specific errors
}

export async function createServiceAction(formData: ServiceFormInput): Promise<ActionResponse<Service>> {
  const validationResult = ServiceSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, message: "Validation failed. Please check the fields.", errors: validationResult.error.issues };
  }

  const { name, priceType, fixedPrice, slabs } = validationResult.data;

  try {
    const serviceToCreate: Omit<Service, 'id' | 'isActive'> = { name, priceType };
    if (priceType === 'Fixed') {
      serviceToCreate.fixedPrice = fixedPrice;
    } else if (priceType === 'Slab-Based' && slabs) {
      serviceToCreate.slabs = slabs;
    }

    const newService = await addServiceAPI(serviceToCreate);
    revalidatePath('/dashboard/admin/services');
    return { success: true, data: newService, message: "Service created successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to create service." };
  }
}

export async function updateServiceAction(serviceId: string, formData: ServiceFormInput): Promise<ActionResponse<Service>> {
  const validationResult = ServiceSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, message: "Validation failed. Please check the fields.", errors: validationResult.error.issues };
  }
  
  const { name, priceType, fixedPrice, slabs, isActive } = validationResult.data;

  try {
    const serviceToUpdate: Partial<Omit<Service, 'id'>> = { name, priceType, isActive };
    if (priceType === 'Fixed') {
      serviceToUpdate.fixedPrice = fixedPrice;
      serviceToUpdate.slabs = undefined; // Explicitly set slabs to undefined
    } else if (priceType === 'Slab-Based' && slabs) {
      serviceToUpdate.slabs = slabs;
      serviceToUpdate.fixedPrice = undefined; // Explicitly set fixedPrice to undefined
    }


    const updatedService = await updateServiceAPI(serviceId, serviceToUpdate);
    if (!updatedService) {
      return { success: false, message: "Service not found." };
    }
    revalidatePath('/dashboard/admin/services');
    return { success: true, data: updatedService, message: "Service updated successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update service." };
  }
}

export async function deleteServiceAction(serviceId: string): Promise<ActionResponse<null>> {
  // This action deactivates the service
  try {
    const success = await deleteServiceAPI(serviceId);
    if (!success) {
      return { success: false, message: "Service not found or already inactive." };
    }
    revalidatePath('/dashboard/admin/services');
    return { success: true, message: "Service deactivated successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to deactivate service." };
  }
}

export async function getServicesAction(): Promise<Service[]> {
  return getAllServicesAdmin();
}
