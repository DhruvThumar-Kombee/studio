
export interface Hospital {
  id: string;
  name: string;
}

export interface ClaimStatus {
  claimStage: string;
  statusDate: string;
  referenceNo: string;
  hospitalName?: string; 
  claimNumber?: string;
  policyNumber?: string;
  patientName?: string;
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

// New types for Authentication
export type UserRole = 'super-admin' | 'admin' | 'staff' | 'hospital' | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
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
