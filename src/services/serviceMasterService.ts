
'use server';
import type { Service, PriceType } from '@/types';
import { mockServices } from '@/lib/mock-data';

// Simulating a database or API
let servicesDB: Service[] = JSON.parse(JSON.stringify(mockServices)); // Deep copy to avoid modifying original mock

export async function getAllServicesAdmin(): Promise<Service[]> {
  // For admin view, show all services including inactive
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return [...servicesDB]; // Return a copy
}

export async function addService(serviceData: Omit<Service, 'id' | 'isActive'>): Promise<Service> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newService: Service = {
    ...serviceData,
    id: `service${Date.now()}${Math.floor(Math.random() * 1000)}`, // More unique ID
    isActive: true, // New services are active by default
  };
  servicesDB.push(newService);
  return { ...newService }; // Return a copy
}

export async function updateService(serviceId: string, updates: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const serviceIndex = servicesDB.findIndex(s => s.id === serviceId);
  if (serviceIndex === -1) {
    return null;
  }
  // Ensure only valid fields are updated
  const currentService = servicesDB[serviceIndex];
  const updatedService = { ...currentService, ...updates };

  // If priceType changed, clear the other type's pricing data
  if (updates.priceType) {
    if (updates.priceType === 'Fixed') {
      updatedService.slabs = undefined;
      if (updates.fixedPrice === undefined) updatedService.fixedPrice = 0; // Default if not provided
    } else if (updates.priceType === 'Slab-Based') {
      updatedService.fixedPrice = undefined;
      if (updates.slabs === undefined) updatedService.slabs = { basePrice: 0, baseLimit: 0, additionalPricePerSlab: 0, slabSize: 1 }; // Default
    }
  }
  
  servicesDB[serviceIndex] = updatedService;
  return { ...servicesDB[serviceIndex] }; // Return a copy
}

export async function deleteService(serviceId: string): Promise<boolean> {
  // This function performs a soft delete (marks as inactive)
  await new Promise(resolve => setTimeout(resolve, 300));
  const serviceIndex = servicesDB.findIndex(s => s.id === serviceId);
  if (serviceIndex === -1 || !servicesDB[serviceIndex].isActive) {
    // Cannot "delete" (deactivate) a non-existent or already inactive service
    return false; 
  }
  servicesDB[serviceIndex].isActive = false; 
  return true;
}
