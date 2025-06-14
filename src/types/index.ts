
export interface Hospital {
  id: string;
  name: string;
}

export type ClaimStageKpi = "Admitted" | "Discharged" | "Submitted" | "Received" | "Settled";
export const kpiClaimStages: ClaimStageKpi[] = ["Admitted", "Discharged", "Submitted", "Received", "Settled"];


export interface ClaimStatus {
  claimStage: string;
  statusDate: string;
  referenceNo: string;
  hospitalName?: string;
  claimNumber?: string;
  policyNumber?: string;
  patientName?: string;
  hospitalId?: string;
}

export interface SearchParams {
  hospitalId: string;
  claimNumber?: string;
  policyNumber?: string;
  patientName?: string;
}

export interface SearchFormValues {
  hospitalId: string;
  claimNumber: string;
  policyNumber: string;
  patientName: string;
}

export type UserRole = 'super-admin' | 'admin' | 'staff' | 'hospital' | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  hospitalId?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: { user: User; token: string }) => void;
  logout: () => void;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Service Master Types
export type PriceType = 'Fixed' | 'Slab-Based';

export interface ServiceSlab {
  basePrice: number;
  baseLimit: number;
  additionalPricePerSlab: number;
  slabSize: number;
}

export interface Service {
  id: string;
  name: string;
  priceType: PriceType;
  fixedPrice?: number;
  slabs?: ServiceSlab;
  isActive: boolean;
}

// Hospital Master Types
export interface Doctor {
  id: string;
  name: string;
  specialty?: string;
}

export type CommissionType = 'Fixed' | 'Percentage';

export interface HospitalReferenceDetails {
  name: string;
  mobile: string;
  commissionType: CommissionType;
  commissionValue: number;
}

export interface HospitalDetails extends Hospital { // Extends the basic Hospital type
  address?: string;
  email?: string;
  mobile?: string;
  assignedDoctorIds: string[]; // Array of Doctor IDs
  associatedServiceIds: string[]; // Array of Service IDs
  reference: HospitalReferenceDetails;
  isActive: boolean;
}

// For select components
export interface SelectOption {
  value: string;
  label: string;
}

// TPA Master Types
export interface TPA {
  id: string;
  name: string;
  address?: string;
  mobile?: string;
  email?: string;
  isActive: boolean;
}
