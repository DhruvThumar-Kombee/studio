
// This page can be a generic dashboard landing or redirect logic can be handled in layout.
// For now, a simple welcome.
"use client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Welcome to Your Dashboard</h1>
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            {user.name && <p><strong>Name:</strong> {user.name}</p>}
          </CardContent>
        </Card>
      )}
      <p className="text-muted-foreground">
        Select an option from the sidebar to get started.
      </p>
    </div>
  );
}
