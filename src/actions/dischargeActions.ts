
'use server';

import { DischargeEntrySchema, type DischargeEntryFormInput } from '@/lib/schemas/dischargeSchemas';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
import type { DischargeEntry, User } from '@/types';
import { createMockDischargeEntry } from '@/services/dischargeService';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function getLoggedInUser(): Promise<User | null> {
    const userCookie = cookies().get('user');
    if (userCookie) {
        try {
            const user: User = JSON.parse(userCookie.value);
            // Allow staff, admin, or super-admin to perform this action
            if (['staff', 'admin', 'super-admin'].includes(user.role!)) {
                return user;
            }
        } catch (e) {
            console.error("Failed to parse user cookie for discharge action", e);
            return null;
        }
    }
    // Fallback for development if no cookie, illustrating the need for robust auth.
    // In production, this should strictly rely on the cookie or auth headers.
    // console.warn("No user cookie found, returning null. Ensure user is logged in.");
    return null;
}


export async function createDischargeEntryAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<DischargeEntry>> {

  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) {
      return {
          success: false,
          message: "User not authenticated or not authorized to perform this action.",
      };
  }

  const rawFormData: { [k: string]: any } = { // Explicitly type rawFormData
    admissionId: formData.get('admissionId'),
    billGenerated: formData.get('billGenerated'),
    // finalBillAmount will be parsed to number or remain undefined
  };

  const finalBillAmountStr = formData.get('finalBillAmount') as string | null;
  if (finalBillAmountStr && finalBillAmountStr.trim() !== '') {
    const parsedAmount = parseFloat(finalBillAmountStr);
    // Check if parsing was successful and it's a non-negative number
    if (!isNaN(parsedAmount) && parsedAmount >= 0) {
        rawFormData.finalBillAmount = parsedAmount;
    } else {
        // If parsing fails or it's negative, let Zod handle the more specific error
        rawFormData.finalBillAmount = finalBillAmountStr; // Pass as string for Zod to catch type error
    }
  } else {
    rawFormData.finalBillAmount = undefined;
  }
  
  const documentEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('documents'));
  const files: File[] = documentEntries.reduce((acc, [key, value]) => {
      // Ensure it's a file and has content before adding
      if (value instanceof File && value.size > 0) { 
          acc.push(value);
      }
      return acc;
  }, [] as File[]);

  rawFormData.documents = files;
  
  const validationResult = DischargeEntrySchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.error("Discharge Validation Errors:", validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the form for errors.",
      errors: validationResult.error.issues,
    };
  }

  try {
    // Pass the already processed 'files' from validationResult.data.documents
    const newDischarge = await createMockDischargeEntry(validationResult.data, validationResult.data.documents, loggedInUser);
    revalidatePath('/dashboard/staff'); // Or a more specific path
    return {
      success: true,
      data: newDischarge,
      message: "Discharge entry created successfully.",
    };
  } catch (error) {
    console.error("Discharge Creation Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create discharge entry.",
    };
  }
}
