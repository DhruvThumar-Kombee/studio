
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HospitalDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Hospital Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Claims Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">View-only access to relevant dashboards and claim statuses.</p>
          {/* Placeholder for hospital specific components */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">View key performance indicators.</p>
        </CardContent>
      </Card>
    </div>
  );
}
