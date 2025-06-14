
import type { z } from 'zod';
import type { DischargeEntrySchema } from '@/lib/schemas/dischargeSchemas';


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

// Patient Admission Types
export type Gender = 'Male' | 'Female' | 'Other';

export interface PatientInfo {
  name: string;
  age: number;
  gender: Gender;
  contactNumber: string;
}

export interface PatientAdmissionFormInput {
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  patientContact: string;
  tpaId: string;
  admissionDate: Date;
  associatedServiceIds: string[]; // Added
  documents: File[]; // Changed to File[] and made mandatory by schema
}

export interface PatientAdmission {
  id: string;
  patientInfo: PatientInfo;
  tpaId: string;
  admissionDate: Date;
  associatedServiceIds: string[]; // Added
  documents: File[]; 
  hospitalId: string; 
  status: ClaimStageKpi; 
}

// Discharge Entry Types
export interface DischargeEntry {
  id: string;
  admissionId: string; 
  dischargeDate: Date; 
  billGenerated: boolean;
  finalBillAmount?: number;
  documents: File[]; 
  submittedByStaffId: string; 
}

export type DischargeEntryFormInput = z.infer<typeof DischargeEntrySchema>;

// Hospital Bill Generator Types
export interface BillFilters {
  hospitalId: string;
  dateFrom: Date;
  dateTo: Date;
}

export interface HospitalBillEntry {
  admissionId: string; // Or a general claim ID
  patientName: string;
  admissionDate: string; // Formatted date string
  servicesDetails: { name: string; price: number }[];
  totalServiceAmount: number;
  commissionType: CommissionType;
  commissionRate: number; // The value or percentage
  calculatedCommission: number;
  netAmountToHospital: number;
  paymentStatus: 'Pending' | 'Received' | 'Partially Paid'; // Example statuses
}

export interface HospitalBillReport {
  hospitalName: string;
  referencePerson: string;
  dateFrom: string;
  dateTo: string;
  entries: HospitalBillEntry[];
  summary: {
    totalBillAmount: number;
    totalCommission: number;
    totalNetToHospital: number;
  };
}

// Reports Module Types
export const ReportType = {
  TOTAL_CLAIMS: 'total_claims',
  OUTSTANDING_CLAIMS: 'outstanding_claims',
  PAYMENTS: 'payments',
  TDS: 'tds',
  REFERENCE_COMMISSION: 'reference_commission',
  EXPENSE: 'expense', // Admin/Super Admin only
  TRANSACTION: 'transaction', // Admin/Super Admin only
  COURIER: 'courier', // Staff only for now
} as const;

export type ReportTypeValue = typeof ReportType[keyof typeof ReportType];

export interface ReportFilters {
  reportType: ReportTypeValue;
  dateFrom?: Date;
  dateTo?: Date;
  hospitalId?: string;
  partyId?: string; // For TPA/Insurance Company
}

export interface ClaimReportItem {
  id: string;
  claimNumber: string;
  patientName: string;
  hospitalName: string;
  admissionDate: string; // Formatted
  claimStage: string;
  policyNumber?: string;
  // totalAmount?: number; // Example field, may vary
  // tpaName?: string;
}

// General Action Response for reports
export interface ReportActionResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T; // Specific report data type
  reportType?: ReportTypeValue; // To help client identify which report data it is
  errors?: z.ZodIssue[];
}

// Transaction (Expense/Income) Module Types
export type TransactionType = 'Expense' | 'Income';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: Date;
  amount: number;
  description: string;
  category?: string; // Optional: For more detailed tracking
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

// Employee Management Types
export const EmployeeRoles = ["Doctor", "Nurse", "Receptionist", "Admin Staff", "Accountant", "Other"] as const;
export type EmployeeRole = typeof EmployeeRoles[number];

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  contact?: string; // Can be phone or email
  isActive: boolean;
}

export interface EmployeeFormInput extends Omit<Employee, 'id' | 'isActive'> {
  isActive?: boolean; // isActive is optional during creation, defaults to true
}
