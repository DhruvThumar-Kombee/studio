
'use server';
import type { HospitalDetails, Doctor, Service } from '@/types';
import { mockHospitalDetailsData, mockDoctors, mockServices } from '@/lib/mock-data';

// Simulating a database or API for hospitals
let hospitalsDB: HospitalDetails[] = JSON.parse(JSON.stringify(mockHospitalDetailsData));

export async function getAllHospitalsAdmin(): Promise<HospitalDetails[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
  return JSON.parse(JSON.stringify(hospitalsDB)); // Return a deep copy
}

export async function getHospitalByIdAdmin(id: string): Promise<HospitalDetails | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const hospital = hospitalsDB.find(h => h.id === id);
  return hospital ? JSON.parse(JSON.stringify(hospital)) : null;
}

export async function addHospitalAdmin(hospitalData: Omit<HospitalDetails, 'id' | 'isActive'>): Promise<HospitalDetails> {
  await new Promise(resolve => setTimeout(resolve, 300));

  // Simulate unique name check (case-insensitive)
  const existingHospital = hospitalsDB.find(h => h.name.toLowerCase() === hospitalData.name.toLowerCase());
  if (existingHospital) {
    throw new Error(`Hospital with name "${hospitalData.name}" already exists.`);
  }

  const newHospital: HospitalDetails = {
    ...hospitalData,
    id: `hosp${Date.now()}${Math.floor(Math.random() * 1000)}`,
    isActive: true, // New hospitals are active by default
  };
  hospitalsDB.push(newHospital);
  return JSON.parse(JSON.stringify(newHospital));
}

export async function updateHospitalAdmin(hospitalId: string, updates: Partial<Omit<HospitalDetails, 'id'>>): Promise<HospitalDetails | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const hospitalIndex = hospitalsDB.findIndex(h => h.id === hospitalId);
  if (hospitalIndex === -1) {
    return null;
  }

  // Simulate unique name check if name is being updated
  if (updates.name && updates.name.toLowerCase() !== hospitalsDB[hospitalIndex].name.toLowerCase()) {
    const existingHospital = hospitalsDB.find(h => h.name.toLowerCase() === updates.name!.toLowerCase() && h.id !== hospitalId);
    if (existingHospital) {
      throw new Error(`Another hospital with name "${updates.name}" already exists.`);
    }
  }

  hospitalsDB[hospitalIndex] = { ...hospitalsDB[hospitalIndex], ...updates };
  return JSON.parse(JSON.stringify(hospitalsDB[hospitalIndex]));
}

export async function deleteHospitalAdmin(hospitalId: string): Promise<boolean> {
  // This function performs a soft delete (marks as inactive)
  await new Promise(resolve => setTimeout(resolve, 300));
  const hospitalIndex = hospitalsDB.findIndex(s => s.id === hospitalId);
  if (hospitalIndex === -1 || !hospitalsDB[hospitalIndex].isActive) {
    return false;
  }
  hospitalsDB[hospitalIndex].isActive = false;
  return true;
}

// Helper functions to get data for select/multi-select components
export async function getDoctorsForSelect(): Promise<Doctor[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(mockDoctors));
}

export async function getServicesForSelect(): Promise<Service[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Only return active services for selection
    return JSON.parse(JSON.stringify(mockServices.filter(s => s.isActive)));
}
