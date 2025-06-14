
import type { Hospital, ClaimStatus, Service, Doctor, HospitalDetails, HospitalReferenceDetails } from '@/types';

export const hospitals: Hospital[] = [
  { id: 'hosp1', name: 'General Hospital' },
  { id: 'hosp2', name: 'City Central Clinic' },
  { id: 'hosp3', name: 'St. Luke’s Medical Center' },
  { id: 'hosp4', name: 'Community Health Services' },
  { id: 'hosp5', name: 'Mercy Hospital' },
];

export const mockClaimsData: ClaimStatus[] = [
  { hospitalId: 'hosp1', claimNumber: '12345', claimStage: 'Settled', statusDate: '2023-10-15', referenceNo: 'REF001', patientName: 'Alice Johnson' },
  { hospitalId: 'hosp1', policyNumber: 'POL123XYZ', claimStage: 'Denied', statusDate: '2023-10-25', referenceNo: 'REF005', patientName: 'Carol White' },
  { hospitalId: 'hosp1', patientName: 'John Doe', claimStage: 'Admitted', statusDate: '2023-09-20', referenceNo: 'REF003', claimNumber: '10001' },
  { hospitalId: 'hosp1', claimNumber: '10002', claimStage: 'Discharged', statusDate: '2024-01-05', referenceNo: 'REF009', patientName: 'Michael Brown' },
  { hospitalId: 'hosp1', claimNumber: '10003', claimStage: 'Submitted', statusDate: '2024-02-10', referenceNo: 'REF010', patientName: 'Linda Davis' },
  { hospitalId: 'hosp1', claimNumber: '10004', claimStage: 'Received', statusDate: '2024-03-15', referenceNo: 'REF011', patientName: 'James Wilson' },
  { hospitalId: 'hosp1', claimNumber: '10005', claimStage: 'Settled', statusDate: '2024-03-20', referenceNo: 'REF012', patientName: 'Patricia Garcia' },
  { hospitalId: 'hosp2', policyNumber: 'POL9876', claimStage: 'Submitted', statusDate: '2023-11-01', referenceNo: 'REF002', patientName: 'Bob Williams', claimNumber: '20001' },
  { hospitalId: 'hosp2', claimNumber: '54321', claimStage: 'Information Requested', statusDate: '2023-11-12', referenceNo: 'REF008', patientName: 'Eva Green' },
  { hospitalId: 'hosp2', claimNumber: '20002', claimStage: 'Admitted', statusDate: '2023-12-01', referenceNo: 'REF013', patientName: 'Robert Jones' },
  { hospitalId: 'hosp2', claimNumber: '20003', claimStage: 'Received', statusDate: '2024-01-20', referenceNo: 'REF014', patientName: 'Jennifer Miller' },
  { hospitalId: 'hosp2', claimNumber: '20004', claimStage: 'Settled', statusDate: '2024-02-28', referenceNo: 'REF015', patientName: 'David Rodriguez' },
  { hospitalId: 'hosp3', patientName: 'Jane Smith', claimStage: 'Discharged', statusDate: '2023-11-05', referenceNo: 'REF004', claimNumber: '30001' },
  { hospitalId: 'hosp3', claimNumber: '30002', claimStage: 'Settled', statusDate: '2023-12-15', referenceNo: 'REF016', patientName: 'Mary Hernandez' },
  { hospitalId: 'hosp3', claimNumber: '30003', claimStage: 'Admitted', statusDate: '2024-03-01', referenceNo: 'REF017', patientName: 'Christopher Smith' },
  { hospitalId: 'hosp4', claimNumber: '67890', claimStage: 'Submitted', statusDate: '2023-11-10', referenceNo: 'REF006', patientName: 'David Brown' },
  { hospitalId: 'hosp4', claimNumber: '40001', claimStage: 'Received', statusDate: '2023-12-20', referenceNo: 'REF018', patientName: 'Lisa Martinez' },
  { hospitalId: 'hosp4', claimNumber: '40002', claimStage: 'Settled', statusDate: '2024-01-25', referenceNo: 'REF019', patientName: 'Daniel Anderson' },
  { hospitalId: 'hosp4', claimNumber: '40003', claimStage: 'Admitted', statusDate: '2024-02-15', referenceNo: 'REF020', patientName: 'Karen Thomas' },
  { hospitalId: 'hosp4', claimNumber: '40004', claimStage: 'Discharged', statusDate: '2024-03-10', referenceNo: 'REF021', patientName: 'Mark Jackson' },
  { hospitalId: 'hosp5', patientName: 'Johnathan Doe', claimStage: 'Settled', statusDate: '2023-08-01', referenceNo: 'REF007', claimNumber: '50001'},
  { hospitalId: 'hosp5', claimNumber: '50002', claimStage: 'Submitted', statusDate: '2024-01-10', referenceNo: 'REF022', patientName: 'Susan White' },
  { hospitalId: 'hosp5', claimNumber: '50003', claimStage: 'Received', statusDate: '2024-02-05', referenceNo: 'REF023', patientName: 'Joseph Harris' },
  { hospitalId: 'hosp5', claimNumber: '50004', claimStage: 'Denied', statusDate: '2024-03-01', referenceNo: 'REF024', patientName: 'Nancy Clark' },
];

export const mockServices: Service[] = [
  {
    id: 'service1',
    name: 'General Consultation',
    priceType: 'Fixed',
    fixedPrice: 500,
    isActive: true,
  },
  {
    id: 'service2',
    name: 'Standard Ward Bed (Per Day)',
    priceType: 'Fixed',
    fixedPrice: 2500,
    isActive: true,
  },
  {
    id: 'service3',
    name: 'Basic Surgery Package',
    priceType: 'Slab-Based',
    slabs: {
      basePrice: 75000,
      baseLimit: 100000, // Up to 1 Lakh
      additionalPricePerSlab: 15000, // Additional 15k
      slabSize: 50000, // For every additional 50k insurance coverage
    },
    isActive: true,
  },
  {
    id: 'service4',
    name: 'Advanced Diagnostic Test',
    priceType: 'Fixed',
    fixedPrice: 3000,
    isActive: false,
  },
  {
    id: 'service5',
    name: 'Intensive Care Unit (ICU) Stay (Per Day)',
    priceType: 'Slab-Based',
    slabs: {
      basePrice: 10000, // Base price for ICU
      baseLimit: 0, // Slab logic applies from the start
      additionalPricePerSlab: 2000, // Increases by 2000
      slabSize: 50000, // For every 50k of sum insured used for this service
    },
    isActive: true,
  },
  {
    id: 'service6',
    name: 'Physiotherapy Session',
    priceType: 'Fixed',
    fixedPrice: 800,
    isActive: true,
  }
];


export const mockDoctors: Doctor[] = [
  { id: 'doc1', name: 'Dr. Emily Carter', specialty: 'Cardiology' },
  { id: 'doc2', name: 'Dr. Benjamin Lee', specialty: 'Neurology' },
  { id: 'doc3', name: 'Dr. Olivia Rodriguez', specialty: 'Pediatrics' },
  { id: 'doc4', name: 'Dr. Samuel Green', specialty: 'Orthopedics' },
  { id: 'doc5', name: 'Dr. Aisha Khan', specialty: 'Oncology' },
];

const defaultReference: HospitalReferenceDetails = {
  name: 'Default Ref',
  mobile: '9000000000',
  commissionType: 'Fixed',
  commissionValue: 0,
};

export const mockHospitalDetailsData: HospitalDetails[] = [
  {
    id: 'hosp1',
    name: 'General Hospital',
    address: '123 Main St, Anytown, USA',
    email: 'contact@generalhospital.com',
    mobile: '1234567890',
    assignedDoctorIds: ['doc1', 'doc3'],
    associatedServiceIds: ['service1', 'service2', 'service3'],
    reference: { name: 'John Smith', mobile: '9876543210', commissionType: 'Fixed', commissionValue: 500 },
    isActive: true,
  },
  {
    id: 'hosp2',
    name: 'City Central Clinic',
    address: '456 Oak Ave, Otherville, USA',
    email: 'info@citycentralclinic.com',
    mobile: '2345678901',
    assignedDoctorIds: ['doc2', 'doc4', 'doc5'],
    associatedServiceIds: ['service1', 'service5', 'service6'],
    reference: { name: 'Maria Garcia', mobile: '8765432109', commissionType: 'Percentage', commissionValue: 5 }, // 5%
    isActive: true,
  },
  {
    id: 'hosp3',
    name: 'St. Luke’s Medical Center',
    address: '789 Pine Rd, Somewhere, USA',
    email: 'admin@stlukes.org',
    mobile: '3456789012',
    assignedDoctorIds: ['doc1', 'doc2', 'doc3', 'doc4'],
    associatedServiceIds: ['service1', 'service2', 'service3', 'service4', 'service5', 'service6'],
    reference: { name: 'David Wilson', mobile: '7654321098', commissionType: 'Fixed', commissionValue: 1000 },
    isActive: true,
  },
  {
    id: 'hosp4',
    name: 'Community Health Services',
    address: '101 Health Way, Newplace, USA',
    email: 'support@communityhealth.com',
    mobile: '4567890123',
    assignedDoctorIds: ['doc5'],
    associatedServiceIds: ['service1', 'service6'],
    reference: { name: 'Linda Brown', mobile: '6543210987', commissionType: 'Percentage', commissionValue: 2.5 }, // 2.5%
    isActive: false, // Inactive example
  },
  {
    id: 'hosp5',
    name: 'Mercy Hospital',
    address: '202 Mercy Ln, Oldtown, USA',
    email: 'mercy@hospital.net',
    mobile: '5678901234',
    assignedDoctorIds: ['doc1', 'doc4'],
    associatedServiceIds: ['service2', 'service3', 'service5'],
    reference: { name: 'Robert Davis', mobile: '5432109876', commissionType: 'Fixed', commissionValue: 750 },
    isActive: true,
  },
];
