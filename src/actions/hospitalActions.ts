
'use server';

import {
  addHospitalAdmin,
  updateHospitalAdmin,
  deleteHospitalAdmin,
  getAllHospitalsAdmin,
  getDoctorsForSelect as getDoctorsForSelectAPI,
  getServicesForSelect as getServicesForSelectAPI,
  getHospitalByIdAdmin
} from '@/services/hospitalService';
import type { HospitalDetails, Doctor, Service } from '@/types';
import { HospitalSchema, type HospitalFormInput } from '@/lib/schemas/hospitalSchemas';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas'; // Re-use ActionResponse
import { revalidatePath } from 'next/cache';

const HOSPITALS_ADMIN_PATH = '/dashboard/admin/hospitals';

export async function createHospitalAction(formData: HospitalFormInput): Promise<ActionResponse<HospitalDetails>> {
  const validationResult = HospitalSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, message: "Validation failed. Please check the fields.", errors: validationResult.error.issues };
  }

  try {
    const newHospital = await addHospitalAdmin(validationResult.data as Omit<HospitalDetails, 'id' | 'isActive'>);
    revalidatePath(HOSPITALS_ADMIN_PATH);
    return { success: true, data: newHospital, message: "Hospital created successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to create hospital." };
  }
}

export async function updateHospitalAction(hospitalId: string, formData: HospitalFormInput): Promise<ActionResponse<HospitalDetails>> {
  const validationResult = HospitalSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, message: "Validation failed. Please check the fields.", errors: validationResult.error.issues };
  }

  try {
    const updatedHospital = await updateHospitalAdmin(hospitalId, validationResult.data);
    if (!updatedHospital) {
      return { success: false, message: "Hospital not found." };
    }
    revalidatePath(HOSPITALS_ADMIN_PATH);
    revalidatePath(`${HOSPITALS_ADMIN_PATH}/edit/${hospitalId}`); // If there was an edit page
    return { success: true, data: updatedHospital, message: "Hospital updated successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update hospital." };
  }
}

export async function deleteHospitalAction(hospitalId: string): Promise<ActionResponse<null>> {
  try {
    const success = await deleteHospitalAdmin(hospitalId);
    if (!success) {
      return { success: false, message: "Hospital not found or already inactive." };
    }
    revalidatePath(HOSPITALS_ADMIN_PATH);
    return { success: true, message: "Hospital deactivated successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to deactivate hospital." };
  }
}

export async function getHospitalsForAdminAction(): Promise<HospitalDetails[]> {
  return getAllHospitalsAdmin();
}

export async function getHospitalByIdAction(id: string): Promise<HospitalDetails | null> {
  return getHospitalByIdAdmin(id);
}


export async function getDoctorsForSelectAction(): Promise<Doctor[]> {
  return getDoctorsForSelectAPI();
}

export async function getServicesForSelectAction(): Promise<Service[]> {
  return getServicesForSelectAPI();
}

export async function toggleHospitalStatusAction(hospitalId: string, currentStatus: boolean): Promise<ActionResponse<HospitalDetails>> {
  try {
    const updatedHospital = await updateHospitalAdmin(hospitalId, { isActive: !currentStatus });
    if (!updatedHospital) {
      return { success: false, message: "Hospital not found." };
    }
    revalidatePath(HOSPITALS_ADMIN_PATH);
    return { success: true, data: updatedHospital, message: `Hospital status updated to ${updatedHospital.isActive ? 'Active' : 'Inactive'}.` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to toggle hospital status." };
  }
}

