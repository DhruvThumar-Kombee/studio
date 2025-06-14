
'use server';
import type { BillFilters, HospitalBillEntry, HospitalBillReport, Service, HospitalDetails, ClaimStatus } from '@/types';
import { mockClaimsData, mockHospitalDetailsData, mockServices, hospitals as allHospitals } from '@/lib/mock-data';
import { format } from 'date-fns';

// Helper function to get service details
function getServiceDetails(serviceId: string): Service | undefined {
  return mockServices.find(s => s.id === serviceId);
}

export async function generateHospitalBillData(filters: BillFilters): Promise<HospitalBillReport | null> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  const hospitalDetails = mockHospitalDetailsData.find(h => h.id === filters.hospitalId);
  if (!hospitalDetails) {
    // console.error(`Hospital not found for ID: ${filters.hospitalId}`);
    return null;
  }

  // Filter claims based on hospitalId and date range (using admissionDate)
  const relevantClaims = mockClaimsData.filter(claim => {
    if (claim.hospitalId !== filters.hospitalId) return false;
    const admissionDate = new Date(claim.statusDate); // Assuming statusDate for admission for mock purposes
    return admissionDate >= filters.dateFrom && admissionDate <= filters.dateTo;
  });

  // console.log(`Found ${relevantClaims.length} claims for hospital ${hospitalDetails.name} in date range.`);

  const billEntries: HospitalBillEntry[] = relevantClaims.map(claim => {
    let totalServiceAmount = 0;
    const servicesDetails: { name: string; price: number }[] = [];

    // Simulate service usage: take up to 3 associated services of the hospital
    // In a real app, this would come from actual service usage records for the claim/admission
    const hospitalAssociatedServices = hospitalDetails.associatedServiceIds;
    for (let i = 0; i < Math.min(hospitalAssociatedServices.length, 3); i++) {
      const service = getServiceDetails(hospitalAssociatedServices[i]);
      if (service && service.priceType === 'Fixed' && service.fixedPrice !== undefined) {
        servicesDetails.push({ name: service.name, price: service.fixedPrice });
        totalServiceAmount += service.fixedPrice;
      } else if (service && service.priceType === 'Slab-Based' && service.slabs) {
        // Simplified: use basePrice for slab-based for this mock
        servicesDetails.push({ name: service.name, price: service.slabs.basePrice });
        totalServiceAmount += service.slabs.basePrice;
      }
    }
    // If no services found via hospital association, add a mock default service amount
     if (servicesDetails.length === 0) {
        servicesDetails.push({ name: "General Services", price: 5000 });
        totalServiceAmount = 5000;
    }


    const commissionRate = hospitalDetails.reference.commissionValue;
    let calculatedCommission = 0;
    if (hospitalDetails.reference.commissionType === 'Fixed') {
      calculatedCommission = commissionRate;
    } else if (hospitalDetails.reference.commissionType === 'Percentage') {
      calculatedCommission = (totalServiceAmount * commissionRate) / 100;
    }

    const netAmountToHospital = totalServiceAmount - calculatedCommission;
    
    // Mock payment status randomly
    const paymentStatusOptions: HospitalBillEntry['paymentStatus'][] = ['Pending', 'Received', 'Partially Paid'];
    const paymentStatus = paymentStatusOptions[Math.floor(Math.random() * paymentStatusOptions.length)];

    return {
      admissionId: claim.referenceNo, // Using referenceNo as a mock admission/claim ID
      patientName: claim.patientName || "N/A",
      admissionDate: format(new Date(claim.statusDate), "PPP"),
      servicesDetails,
      totalServiceAmount,
      commissionType: hospitalDetails.reference.commissionType,
      commissionRate,
      calculatedCommission,
      netAmountToHospital,
      paymentStatus,
    };
  });

  const summary = billEntries.reduce((acc, entry) => {
    acc.totalBillAmount += entry.totalServiceAmount;
    acc.totalCommission += entry.calculatedCommission;
    acc.totalNetToHospital += entry.netAmountToHospital;
    return acc;
  }, { totalBillAmount: 0, totalCommission: 0, totalNetToHospital: 0 });
  
  const reportHospital = allHospitals.find(h => h.id === filters.hospitalId);


  return {
    hospitalName: reportHospital?.name || 'Unknown Hospital',
    referencePerson: hospitalDetails.reference.name,
    dateFrom: format(filters.dateFrom, "PPP"),
    dateTo: format(filters.dateTo, "PPP"),
    entries: billEntries,
    summary
  };
}

// To fetch hospitals for the select dropdown
export async function getHospitalsForBillingSelect(): Promise<{ value: string; label: string }[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockHospitalDetailsData
    .filter(h => h.isActive)
    .map(h => ({ value: h.id, label: h.name }));
}
