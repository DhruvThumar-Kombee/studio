
import { PatientAdmissionForm } from "@/components/dashboard/admissions/PatientAdmissionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewPatientAdmissionPage() {
  return (
    <div className="space-y-6">
       <PatientAdmissionForm />
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering if fetching TPAs on server
