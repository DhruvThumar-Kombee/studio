
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HospitalBillGeneratorClient } from "@/components/dashboard/bills/HospitalBillGeneratorClient";
import { getHospitalsForBillingSelect } from "@/services/billService"; // Service to get hospitals for select
import { FileSpreadsheet } from "lucide-react";

export default async function HospitalBillsPage() {
  const hospitals = await getHospitalsForBillingSelect();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Hospital Bill Generator</h1>
          <p className="text-muted-foreground">Generate and view hospital bills based on filters.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate Bill Report</CardTitle>
          <CardDescription>Select filters to generate the bill report for a hospital.</CardDescription>
        </CardHeader>
        <CardContent>
          <HospitalBillGeneratorClient availableHospitals={hospitals} />
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure data is fresh
