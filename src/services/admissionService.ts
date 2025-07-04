
'use server';
import type { PatientAdmission, PatientAdmissionFormInput } from '@/types'; // PatientAdmissionFormInput now includes associatedServiceIds
import { mockHospitalDetailsData } from '@/lib/mock-data'; // For hospitalId example

// Simulating a database or API for admissions
let admissionsDB: PatientAdmission[] = [];

export async function createMockAdmission(
  data: PatientAdmissionFormInput, // This type now includes associatedServiceIds
  files: File[],
  hospitalId: string // Assuming hospitalId comes from logged-in user or a selection
): Promise<PatientAdmission> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  const newAdmission: PatientAdmission = {
    id: `adm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
    patientInfo: {
      name: data.patientName,
      age: data.patientAge,
      gender: data.patientGender,
      contactNumber: data.patientContact,
    },
    tpaId: data.tpaId,
    admissionDate: data.admissionDate,
    associatedServiceIds: data.associatedServiceIds, // Store selected services
    documents: files, // Storing File objects directly for mock, in real app store paths/references
    hospitalId: hospitalId, 
    status: 'Admitted', // Default status on admission
  };

  admissionsDB.push(newAdmission);
  console.log("New Admission Created (Mock):", newAdmission);
  console.log("Total Admissions (Mock DB):", admissionsDB.length);
  return JSON.parse(JSON.stringify(newAdmission)); // Return a copy
}

// Example of how you might fetch admissions for a hospital (view-only for hospital role)
export async function getAdmissionsForHospital(hospitalId: string): Promise<PatientAdmission[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(JSON.stringify(admissionsDB.filter(adm => adm.hospitalId === hospitalId)));
}
