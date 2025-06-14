
export interface Hospital {
  id: string;
  name: string;
}

// Specific stages for dashboard KPIs
export type ClaimStageKpi = "Admitted" | "Discharged" | "Submitted" | "Received" | "Settled";
export const kpiClaimStages: ClaimStageKpi[] = ["Admitted", "Discharged", "Submitted", "Received", "Settled"];


export interface ClaimStatus {
  claimStage: string; // Allows for other stages like "Denied" in data
  statusDate: string; // ISO date string (e.g., "2023-11-15")
  referenceNo: string;
  hospitalName?: string; 
  claimNumber?: string;
  policyNumber?: string;
  patientName?: string;
  hospitalId?: string; // Added to associate claim with a hospital
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
  hospitalId?: string; // Optional: For users associated with a specific hospital
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

