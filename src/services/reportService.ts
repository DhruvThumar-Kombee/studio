
'use server';
import type { ReportFiltersFormInput, ClaimReportItem } from '@/types';
import { mockClaimsData, mockHospitalDetailsData, mockTPAs } from '@/lib/mock-data';
import { format } from 'date-fns';

export async function getTotalClaimsReport(filters: ReportFiltersFormInput): Promise<ClaimReportItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  let filteredClaims = [...mockClaimsData];

  // Filter by Hospital ID
  if (filters.hospitalId) {
    filteredClaims = filteredClaims.filter(claim => claim.hospitalId === filters.hospitalId);
  }

  // Filter by Date Range (using claim's statusDate as a proxy for admission/claim date)
  if (filters.dateFrom) {
    filteredClaims = filteredClaims.filter(claim => new Date(claim.statusDate) >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    // Adjust dateTo to be inclusive of the whole day
    const dateToInclusive = new Date(filters.dateTo);
    dateToInclusive.setHours(23, 59, 59, 999);
    filteredClaims = filteredClaims.filter(claim => new Date(claim.statusDate) <= dateToInclusive);
  }
  
  // Filter by Party ID (TPA) - assuming claim has a tpaId field (add if not present)
  // For this mock, we'll assume mockClaimsData doesn't have tpaId directly,
  // so this filter won't do anything unless mockClaimsData is updated.
  // If you update mockClaimsData to include a tpaId (e.g., from mockTPAs), this will work.
  // if (filters.partyId) {
  //   filteredClaims = filteredClaims.filter(claim => (claim as any).tpaId === filters.partyId);
  // }


  return filteredClaims.map(claim => {
    const hospital = mockHospitalDetailsData.find(h => h.id === claim.hospitalId);
    // const tpa = claim.tpaId ? mockTPAs.find(t => t.id === claim.tpaId) : undefined; // Example if tpaId exists on claim

    return {
      id: claim.referenceNo, // Using referenceNo as a unique ID for the report item
      claimNumber: claim.claimNumber || 'N/A',
      patientName: claim.patientName || 'N/A',
      hospitalName: hospital?.name || 'Unknown Hospital',
      admissionDate: format(new Date(claim.statusDate), 'PPP'), // Using statusDate as admission date
      claimStage: claim.claimStage,
      policyNumber: claim.policyNumber || 'N/A',
      // tpaName: tpa?.name || 'N/A', // Example
      // totalAmount: Math.floor(Math.random() * 50000) + 10000, // Mock amount
    };
  });
}

// Placeholder for other report service functions
// export async function getOutstandingClaimsReport(filters: ReportFiltersFormInput): Promise<any[]> { ... }
// export async function getPaymentsReport(filters: ReportFiltersFormInput): Promise<any[]> { ... }
// ... and so on for other report types
