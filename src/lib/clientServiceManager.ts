// src/lib/clientServiceManager.ts
import type { Service } from '@/types';
import type { ServiceFormInput } from '@/lib/schemas/serviceSchemas';
import { mockServices } from '@/lib/mock-data'; // To initialize if local storage is empty

const LOCAL_STORAGE_KEY = 'claimClarityServices';

function getServicesFromLocalStorage(): Service[] {
  if (typeof window !== 'undefined') {
    const storedServices = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedServices) {
      try {
        // Ensure dates are properly handled if services ever include them
        return JSON.parse(storedServices);
      } catch (e) {
        console.error("Error parsing services from localStorage", e);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockServices));
        return [...mockServices];
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockServices));
      return [...mockServices];
    }
  }
  return []; 
}

function saveServicesToLocalStorage(services: Service[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(services));
  }
}

export function getClientServices(): Service[] {
  return getServicesFromLocalStorage();
}

export function getClientServiceById(serviceId: string): Service | null {
  const services = getServicesFromLocalStorage();
  return services.find(s => s.id === serviceId) || null;
}

export function addClientService(serviceData: ServiceFormInput): Service {
  const services = getServicesFromLocalStorage();
  const newService: Service = {
    name: serviceData.name,
    priceType: serviceData.priceType,
    id: `service-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    isActive: serviceData.isActive === undefined ? true : serviceData.isActive,
    fixedPrice: serviceData.priceType === 'Fixed' ? serviceData.fixedPrice : undefined,
    slabs: serviceData.priceType === 'Slab-Based' ? serviceData.slabs : undefined,
  };
  const updatedServices = [...services, newService];
  saveServicesToLocalStorage(updatedServices);
  return newService;
}

export function updateClientService(serviceId: string, updates: ServiceFormInput): Service | null {
  let services = getServicesFromLocalStorage();
  const serviceIndex = services.findIndex(s => s.id === serviceId);
  if (serviceIndex === -1) {
    return null;
  }
  const updatedService: Service = {
    ...services[serviceIndex],
    ...updates,
    isActive: updates.isActive === undefined ? services[serviceIndex].isActive : updates.isActive,
    fixedPrice: updates.priceType === 'Fixed' ? updates.fixedPrice : undefined,
    slabs: updates.priceType === 'Slab-Based' ? updates.slabs : undefined,
  };
  services[serviceIndex] = updatedService;
  saveServicesToLocalStorage(services);
  return updatedService;
}

export function toggleClientServiceStatus(serviceId: string): Service | null {
    let services = getServicesFromLocalStorage();
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) {
        return null;
    }
    services[serviceIndex].isActive = !services[serviceIndex].isActive;
    saveServicesToLocalStorage(services);
    return services[serviceIndex];
}
