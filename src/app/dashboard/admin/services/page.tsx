
'use client'; // This page now renders ServiceTable which fetches client-side

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { ServiceTable } from "@/components/dashboard/services/ServiceTable";
// getServicesAction is removed as data is fetched client-side by ServiceTable
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ServiceMasterPage() {
  // Services are now fetched by ServiceTable from Local Storage

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Service Master</h1>
          <p className="text-muted-foreground">Manage healthcare services and their pricing models (Data stored in Local Storage).</p>
        </div>
        <Link href="/dashboard/admin/services/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Service
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service List</CardTitle>
          <CardDescription>View, edit, or change the status of services offered.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceTable />
        </CardContent>
      </Card>
    </div>
  );
}
