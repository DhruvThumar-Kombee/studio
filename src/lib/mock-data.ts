
import type { Hospital, ClaimStatus, SearchParams } from '@/types';

export const hospitals: Hospital[] = [
  { id: 'hosp1', name: 'General Hospital' },
  { id: 'hosp2', name: 'City Central Clinic' },
  { id: 'hosp3', name: 'St. Luke’s Medical Center' },
  { id: 'hosp4', name: 'Community Health Services' },
  { id: 'hosp5', name: 'Mercy Hospital' },
];

export const mockClaimsData: (ClaimStatus & SearchParams)[] = [
  { hospitalId: 'hosp1', claimNumber: '12345', claimStage: 'Settled', statusDate: '2023-10-15', referenceNo: 'REF001', patientName: 'Alice Johnson' },
  { hospitalId: 'hosp2', policyNumber: 'POL9876', claimStage: 'In Review', statusDate: '2023-11-01', referenceNo: 'REF002', patientName: 'Bob Williams' },
  { hospitalId: 'hosp1', patientName: 'John Doe', claimStage: 'Admitted', statusDate: '2023-09-20', referenceNo: 'REF003' },
  { hospitalId: 'hosp3', patientName: 'Jane Smith', claimStage: 'Discharged', statusDate: '2023-11-05', referenceNo: 'REF004' },
  { hospitalId: 'hosp1', policyNumber: 'POL123XYZ', claimStage: 'Denied', statusDate: '2023-10-25', referenceNo: 'REF005', patientName: 'Carol White' },
  { hospitalId: 'hosp4', claimNumber: '67890', claimStage: 'File Submitted', statusDate: '2023-11-10', referenceNo: 'REF006', patientName: 'David Brown' },
  { hospitalId: 'hosp5', patientName: 'johnathan doe', claimStage: 'Settled', statusDate: '2023-08-01', referenceNo: 'REF007'},
  { hospitalId: 'hosp2', claimNumber: '54321', claimStage: 'Information Requested', statusDate: '2023-11-12', referenceNo: 'REF008', patientName: 'Eva Green' },
];
