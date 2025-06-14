
import type { Hospital, ClaimStatus, SearchParams } from '@/types';

export const hospitals: Hospital[] = [
  { id: 'hosp1', name: 'General Hospital' },
  { id: 'hosp2', name: 'City Central Clinic' },
  { id: 'hosp3', name: 'St. Luke’s Medical Center' },
  { id: 'hosp4', name: 'Community Health Services' },
  { id: 'hosp5', name: 'Mercy Hospital' },
];

// Enhanced mock claims data with more diverse stages and dates
export const mockClaimsData: ClaimStatus[] = [
  // Hosp1
  { hospitalId: 'hosp1', claimNumber: '12345', claimStage: 'Settled', statusDate: '2023-10-15', referenceNo: 'REF001', patientName: 'Alice Johnson' },
  { hospitalId: 'hosp1', policyNumber: 'POL123XYZ', claimStage: 'Denied', statusDate: '2023-10-25', referenceNo: 'REF005', patientName: 'Carol White' },
  { hospitalId: 'hosp1', patientName: 'John Doe', claimStage: 'Admitted', statusDate: '2023-09-20', referenceNo: 'REF003', claimNumber: '10001' },
  { hospitalId: 'hosp1', claimNumber: '10002', claimStage: 'Discharged', statusDate: '2024-01-05', referenceNo: 'REF009', patientName: 'Michael Brown' },
  { hospitalId: 'hosp1', claimNumber: '10003', claimStage: 'Submitted', statusDate: '2024-02-10', referenceNo: 'REF010', patientName: 'Linda Davis' },
  { hospitalId: 'hosp1', claimNumber: '10004', claimStage: 'Received', statusDate: '2024-03-15', referenceNo: 'REF011', patientName: 'James Wilson' },
  { hospitalId: 'hosp1', claimNumber: '10005', claimStage: 'Settled', statusDate: '2024-03-20', referenceNo: 'REF012', patientName: 'Patricia Garcia' },

  // Hosp2
  { hospitalId: 'hosp2', policyNumber: 'POL9876', claimStage: 'Submitted', statusDate: '2023-11-01', referenceNo: 'REF002', patientName: 'Bob Williams', claimNumber: '20001' },
  { hospitalId: 'hosp2', claimNumber: '54321', claimStage: 'Information Requested', statusDate: '2023-11-12', referenceNo: 'REF008', patientName: 'Eva Green' },
  { hospitalId: 'hosp2', claimNumber: '20002', claimStage: 'Admitted', statusDate: '2023-12-01', referenceNo: 'REF013', patientName: 'Robert Jones' },
  { hospitalId: 'hosp2', claimNumber: '20003', claimStage: 'Received', statusDate: '2024-01-20', referenceNo: 'REF014', patientName: 'Jennifer Miller' },
  { hospitalId: 'hosp2', claimNumber: '20004', claimStage: 'Settled', statusDate: '2024-02-28', referenceNo: 'REF015', patientName: 'David Rodriguez' },
  
  // Hosp3
  { hospitalId: 'hosp3', patientName: 'Jane Smith', claimStage: 'Discharged', statusDate: '2023-11-05', referenceNo: 'REF004', claimNumber: '30001' },
  { hospitalId: 'hosp3', claimNumber: '30002', claimStage: 'Settled', statusDate: '2023-12-15', referenceNo: 'REF016', patientName: 'Mary Hernandez' },
  { hospitalId: 'hosp3', claimNumber: '30003', claimStage: 'Admitted', statusDate: '2024-03-01', referenceNo: 'REF017', patientName: 'Christopher Smith' },

  // Hosp4 (Hospital user might be associated with this one)
  { hospitalId: 'hosp4', claimNumber: '67890', claimStage: 'Submitted', statusDate: '2023-11-10', referenceNo: 'REF006', patientName: 'David Brown' },
  { hospitalId: 'hosp4', claimNumber: '40001', claimStage: 'Received', statusDate: '2023-12-20', referenceNo: 'REF018', patientName: 'Lisa Martinez' },
  { hospitalId: 'hosp4', claimNumber: '40002', claimStage: 'Settled', statusDate: '2024-01-25', referenceNo: 'REF019', patientName: 'Daniel Anderson' },
  { hospitalId: 'hosp4', claimNumber: '40003', claimStage: 'Admitted', statusDate: '2024-02-15', referenceNo: 'REF020', patientName: 'Karen Thomas' },
  { hospitalId: 'hosp4', claimNumber: '40004', claimStage: 'Discharged', statusDate: '2024-03-10', referenceNo: 'REF021', patientName: 'Mark Jackson' },

  // Hosp5
  { hospitalId: 'hosp5', patientName: 'Johnathan Doe', claimStage: 'Settled', statusDate: '2023-08-01', referenceNo: 'REF007', claimNumber: '50001'},
  { hospitalId: 'hosp5', claimNumber: '50002', claimStage: 'Submitted', statusDate: '2024-01-10', referenceNo: 'REF022', patientName: 'Susan White' },
  { hospitalId: 'hosp5', claimNumber: '50003', claimStage: 'Received', statusDate: '2024-02-05', referenceNo: 'REF023', patientName: 'Joseph Harris' },
  { hospitalId: 'hosp5', claimNumber: '50004', claimStage: 'Denied', statusDate: '2024-03-01', referenceNo: 'REF024', patientName: 'Nancy Clark' },
];
