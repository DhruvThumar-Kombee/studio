
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Staff Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Claims Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Access tools for claims, documents, and courier tracking.</p>
          {/* Placeholder for staff specific components */}
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Document Center</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage and track claim-related documents.</p>
        </CardContent>
      </Card>
    </div>
  );
}
