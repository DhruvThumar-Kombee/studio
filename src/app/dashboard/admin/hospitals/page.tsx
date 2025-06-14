
import { HospitalTable } from "@/components/dashboard/hospitals/HospitalTable";
import { getHospitalsForAdminAction, getDoctorsForSelectAction, getServicesForSelectAction } from "@/actions/hospitalActions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function HospitalMasterPage() {
  // Fetch initial data in parallel
  const [hospitals, doctors, services] = await Promise.all([
    getHospitalsForAdminAction(),
    getDoctorsForSelectAction(),
    getServicesForSelectAction()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Hospital Master</h1>
        <p className="text-muted-foreground">Manage hospital details, associated doctors, and services.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hospital List</CardTitle>
          <CardDescription>View, add, edit, or change the status of hospitals.</CardDescription>
        </CardHeader>
        <CardContent>
          <HospitalTable 
            initialHospitals={hospitals} 
            initialDoctors={doctors}
            initialServices={services}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure data is fresh on each request
