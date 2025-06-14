
'use server';
import type { DischargeEntry, DischargeEntryFormInput, User } from '@/types';
// import { admissionsDB, type PatientAdmission } from './admissionService'; // Example: If you want to update admission status

let dischargeEntriesDB: DischargeEntry[] = [];

export async function createMockDischargeEntry(
  data: DischargeEntryFormInput,
  processedFiles: File[], // The files array after FormData processing and basic validation
  staffUser: User 
): Promise<DischargeEntry> {
  await new Promise(resolve => setTimeout(resolve, 500)); 

  if (!staffUser || (staffUser.role !== 'staff' && staffUser.role !== 'admin' && staffUser.role !== 'super-admin')) {
    throw new Error("Unauthorized: Only authorized staff or admins can create discharge entries.");
  }

  const newDischarge: DischargeEntry = {
    id: `dis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    admissionId: data.admissionId,
    dischargeDate: new Date(), 
    billGenerated: data.billGenerated === 'yes',
    finalBillAmount: data.billGenerated === 'yes' ? data.finalBillAmount : undefined, // Ensure amount is only set if bill generated
    documents: processedFiles, 
    submittedByStaffId: staffUser.id,
  };

  dischargeEntriesDB.push(newDischarge);
  console.log("New Discharge Entry Created (Mock):", newDischarge);
  
  // Optional: Update corresponding admission status in a shared mock DB
  // const admissionIndex = admissionsDB.findIndex((adm: PatientAdmission) => adm.id === data.admissionId);
  // if (admissionIndex > -1) {
  //   admissionsDB[admissionIndex].status = 'Discharged'; 
  //   console.log(`Admission ${data.admissionId} status updated to Discharged.`);
  // }

  return JSON.parse(JSON.stringify(newDischarge)); 
}

// Example: Function to get discharge entries (e.g., for listing later)
export async function getDischargeEntriesForAdmission(admissionId: string): Promise<DischargeEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(JSON.stringify(dischargeEntriesDB.filter(de => de.admissionId === admissionId)));
}
