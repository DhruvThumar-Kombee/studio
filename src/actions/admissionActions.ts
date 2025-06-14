
'use server';

import { PatientAdmissionSchema } from '@/lib/schemas/admissionSchemas';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
import type { PatientAdmission } from '@/types';
import { createMockAdmission } from '@/services/admissionService';
import { revalidatePath } from 'next/cache';

// For now, assume hospitalId is fixed or comes from user session (not implemented here)
const MOCK_HOSPITAL_ID_FOR_STAFF = 'hosp1'; // Replace with actual logic

export async function createPatientAdmissionAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<PatientAdmission>> {
  
  const rawFormData: Record<string, any> = {};
  const files: File[] = [];
  const serviceIds: string[] = [];

  for (const [key, value] of formData.entries()) {
    if (key === "admissionDate" && typeof value === 'string') {
        rawFormData[key] = new Date(value);
    } else if (key === "patientAge" && typeof value === 'string'){
        rawFormData[key] = value === "" ? undefined : Number(value);
    } else if (key.startsWith('documents[')) { // Check for documents array
        if (value instanceof File && value.size > 0) {
            files.push(value);
        }
    } else if (key === 'associatedServiceIds') { // Handle multi-select for services
        serviceIds.push(value as string);
    }
     else {
        rawFormData[key] = value;
    }
  }
  
  rawFormData.documents = files; // Assign collected files to be validated by Zod
  rawFormData.associatedServiceIds = serviceIds; // Assign collected service IDs

  const validationResult = PatientAdmissionSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.error("Validation Errors:", validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the fields.",
      errors: validationResult.error.issues,
    };
  }

  try {
    // Pass the validated data, which now includes associatedServiceIds and validated documents (File[])
    const newAdmission = await createMockAdmission(validationResult.data, validationResult.data.documents, MOCK_HOSPITAL_ID_FOR_STAFF);
    revalidatePath('/dashboard/staff/admissions/new'); // Or a more specific path if admissions are listed
    return {
      success: true,
      data: newAdmission, // This includes the ID
      message: `Patient admission (ID: ${newAdmission.id}) created successfully.`,
    };
  } catch (error) {
    console.error("Admission Creation Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create patient admission.",
    };
  }
}
