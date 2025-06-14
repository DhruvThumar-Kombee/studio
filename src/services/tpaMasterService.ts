
'use server';
import type { TPA } from '@/types';
import { mockTPAs } from '@/lib/mock-data';

let tpasDB: TPA[] = JSON.parse(JSON.stringify(mockTPAs)); // Deep copy

export async function getAllTPAsAdmin(): Promise<TPA[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(tpasDB));
}

export async function getTPAByIdAdmin(id: string): Promise<TPA | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const tpa = tpasDB.find(t => t.id === id);
  return tpa ? JSON.parse(JSON.stringify(tpa)) : null;
}

export async function addTPAAdmin(tpaData: Omit<TPA, 'id' | 'isActive'>): Promise<TPA> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const existingTPA = tpasDB.find(t => t.name.toLowerCase() === tpaData.name.toLowerCase());
  if (existingTPA) {
    throw new Error(`TPA with name "${tpaData.name}" already exists.`);
  }

  const newTPA: TPA = {
    ...tpaData,
    id: `tpa${Date.now()}${Math.floor(Math.random() * 1000)}`,
    isActive: true,
  };
  tpasDB.push(newTPA);
  return JSON.parse(JSON.stringify(newTPA));
}

export async function updateTPAAdmin(tpaId: string, updates: Partial<Omit<TPA, 'id'>>): Promise<TPA | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const tpaIndex = tpasDB.findIndex(t => t.id === tpaId);
  if (tpaIndex === -1) {
    return null;
  }

  if (updates.name && updates.name.toLowerCase() !== tpasDB[tpaIndex].name.toLowerCase()) {
    const existingTPA = tpasDB.find(t => t.name.toLowerCase() === updates.name!.toLowerCase() && t.id !== tpaId);
    if (existingTPA) {
      throw new Error(`Another TPA with name "${updates.name}" already exists.`);
    }
  }

  tpasDB[tpaIndex] = { ...tpasDB[tpaIndex], ...updates };
  return JSON.parse(JSON.stringify(tpasDB[tpaIndex]));
}

export async function deleteTPAAdmin(tpaId: string): Promise<boolean> {
  // Soft delete
  await new Promise(resolve => setTimeout(resolve, 300));
  const tpaIndex = tpasDB.findIndex(t => t.id === tpaId);
  if (tpaIndex === -1 || !tpasDB[tpaIndex].isActive) {
    return false;
  }
  tpasDB[tpaIndex].isActive = false;
  return true;
}
