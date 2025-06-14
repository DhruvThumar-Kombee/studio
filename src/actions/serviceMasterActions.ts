
'use server';

import { 
  addService as addServiceAPI, 
  updateService as updateServiceAPI, 
  deleteService as deleteServiceAPI, 
  getAllServicesAdmin 
} from '@/services/serviceMasterService';
import type { Service } from '@/types';
import { ServiceSchema, type ServiceFormInput, type ActionResponse } from '@/lib/schemas/serviceSchemas';
import { revalidatePath } from 'next/cache';


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
      serviceToUpdate.slabs = undefined; 
    } else if (priceType === 'Slab-Based' && slabs) {
      serviceToUpdate.slabs = slabs;
      serviceToUpdate.fixedPrice = undefined; 
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
