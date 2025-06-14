
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Management Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage hospitals, claims, master data, and view reports.</p>
          {/* Placeholder for admin specific components */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Hospital Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Oversee hospital data and performance.</p>
        </CardContent>
      </Card>
    </div>
  );
}
