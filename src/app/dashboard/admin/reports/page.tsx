
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportGeneratorClient } from "@/components/dashboard/reports/ReportGeneratorClient";
import { getHospitalsForAdminAction } from "@/actions/hospitalActions"; // To populate hospital filter
import { BarChart3 } from "lucide-react";

export default async function AdminReportsPage() {
  // Fetch data needed for filters, e.g., list of hospitals
  const hospitals = await getHospitalsForAdminAction();
  const hospitalOptions = hospitals.map(h => ({ value: h.id, label: h.name }));

  // TPAs can be fetched similarly if/when a party filter is added for TPA reports
  // const tpas = await getTPAsAction();
  // const tpaOptions = tpas.map(t => ({ value: t.id, label: t.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Reports Module</h1>
          <p className="text-muted-foreground">Generate and view various system reports.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select filters and report type to generate a report.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportGeneratorClient 
            availableHospitals={hospitalOptions}
            // availableParties={tpaOptions} // For TPA/Insurance filter later
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure data for filters is fresh
