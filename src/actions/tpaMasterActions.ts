
'use server';

import { 
  addTPAAdmin, 
  updateTPAAdmin, 
  deleteTPAAdmin, 
  getAllTPAsAdmin,
  getTPAByIdAdmin
} from '@/services/tpaMasterService';
import type { TPA } from '@/types';
import { TPASchema, type TPAFormInput } from '@/lib/schemas/tpaSchemas';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas'; // Re-use ActionResponse
import { revalidatePath } from 'next/cache';

const TPAS_ADMIN_PATH = '/dashboard/admin/tpas';

export async function createTPAAction(formData: TPAFormInput): Promise<ActionResponse<TPA>> {
  const validationResult = TPASchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, message: "Validation failed. Please check the fields.", errors: validationResult.error.issues };
  }

  try {
    const newTPA = await addTPAAdmin(validationResult.data as Omit<TPA, 'id' | 'isActive'>);
    revalidatePath(TPAS_ADMIN_PATH);
    return { success: true, data: newTPA, message: "TPA created successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to create TPA." };
  }
}

export async function updateTPAAction(tpaId: string, formData: TPAFormInput): Promise<ActionResponse<TPA>> {
  const validationResult = TPASchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, message: "Validation failed. Please check the fields.", errors: validationResult.error.issues };
  }

  try {
    const updatedTPA = await updateTPAAdmin(tpaId, validationResult.data);
    if (!updatedTPA) {
      return { success: false, message: "TPA not found." };
    }
    revalidatePath(TPAS_ADMIN_PATH);
    return { success: true, data: updatedTPA, message: "TPA updated successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update TPA." };
  }
}

export async function deleteTPAAction(tpaId: string): Promise<ActionResponse<null>> {
  try {
    const success = await deleteTPAAdmin(tpaId);
    if (!success) {
      return { success: false, message: "TPA not found or already inactive." };
    }
    revalidatePath(TPAS_ADMIN_PATH);
    return { success: true, message: "TPA deactivated successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to deactivate TPA." };
  }
}

export async function getTPAsAction(): Promise<TPA[]> {
  return getAllTPAsAdmin();
}

export async function getTPAByIdAction(id: string): Promise<TPA | null> {
  return getTPAByIdAdmin(id);
}

export async function toggleTPAStatusAction(tpaId: string, currentStatus: boolean): Promise<ActionResponse<TPA>> {
  try {
    const updatedTPA = await updateTPAAdmin(tpaId, { isActive: !currentStatus });
    if (!updatedTPA) {
      return { success: false, message: "TPA not found." };
    }
    revalidatePath(TPAS_ADMIN_PATH);
    return { success: true, data: updatedTPA, message: `TPA status updated to ${updatedTPA.isActive ? 'Active' : 'Inactive'}.` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to toggle TPA status." };
  }
}
