export interface Hospital {
  id: string;
  name: string;
}

export interface ClaimStatus {
  claimStage: string;
  statusDate: string;
  referenceNo: string;
  hospitalName?: string; // Optional: to display which hospital it was found under if needed
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
