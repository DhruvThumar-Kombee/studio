
import type { ClaimStatus, SearchParams } from '@/types';
import { hospitals, mockClaimsData } from '@/lib/mock-data';

export async function mockApiSearch(params: SearchParams): Promise<ClaimStatus | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      const { hospitalId, claimNumber, policyNumber, patientName } = params;
      let foundClaim: (ClaimStatus & SearchParams) | undefined;

      if (claimNumber) {
        foundClaim = mockClaimsData.find(
          c => c.hospitalId === hospitalId && c.claimNumber === claimNumber
        );
      } else if (policyNumber) {
        foundClaim = mockClaimsData.find(
          c => c.hospitalId === hospitalId && c.policyNumber === policyNumber
        );
      } else if (patientName) {
        const lowerPatientName = patientName.toLowerCase();
        // Basic fuzzy matching: check if the stored patient name includes the searched name
        foundClaim = mockClaimsData.find(
          c => c.hospitalId === hospitalId && c.patientName?.toLowerCase().includes(lowerPatientName)
        );
      }
      
      if (foundClaim) {
        const hospital = hospitals.find(h => h.id === foundClaim!.hospitalId);
        resolve({ ...foundClaim, hospitalName: hospital?.name });
      } else {
        resolve(null);
      }
    }, 1500); // Simulate network delay
  });
}
