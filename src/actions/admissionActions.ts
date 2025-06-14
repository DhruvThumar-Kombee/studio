
'use server';

import { PatientAdmissionSchema, type PatientAdmissionFormInput } from '@/lib/schemas/admissionSchemas';
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
    for (const [key, value] of formData.entries()) {
        if (key === "admissionDate") {
            rawFormData[key] = new Date(value as string);
        } else if (key === "patientAge"){
            rawFormData[key] = value === "" ? undefined : Number(value);
        }
         else {
            rawFormData[key] = value;
        }
    }
  
  // Documents handling
  const documentEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('documents'));
  const files: File[] = documentEntries.reduce((acc, [key, value]) => {
      if (value instanceof File && value.size > 0) { // Ensure it's a real file, not an empty input
          acc.push(value);
      }
      return acc;
  }, [] as File[]);

  // Replace rawFormData.documents with the actual files for validation if needed,
  // or handle file validation separately / primarily on server
  // For Zod schema, we might pass file metadata or skip its direct validation here
  // and rely on server-side checks for content, size, type.
  
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
    // In a real scenario, hospitalId might come from the logged-in staff user's context
    const newAdmission = await createMockAdmission(validationResult.data, files, MOCK_HOSPITAL_ID_FOR_STAFF);
    revalidatePath('/dashboard/staff'); // Or a more specific path if admissions are listed
    return {
      success: true,
      data: newAdmission,
      message: "Patient admission created successfully.",
    };
  } catch (error) {
    console.error("Admission Creation Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create patient admission.",
    };
  }
}
