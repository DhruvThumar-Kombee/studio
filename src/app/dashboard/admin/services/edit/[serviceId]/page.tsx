'use client'; // This page needs to be a client component to fetch data from Local Storage

import * as React from 'react';
import { HospitalForm } from '@/components/dashboard/services/ServiceForm';
import { getClientServiceById } from '@/lib/clientServiceManager'; // Use client-side fetcher
import type { Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Removed async getServiceById as data is fetched client-side

export default function EditServicePage({ params }: { params: { serviceId: string } }) {
  const [service, setService] = React.useState<Service | null | undefined>(undefined); // undefined for loading state
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (params.serviceId) {
      setIsLoading(true);
      const fetchedService = getClientServiceById(params.serviceId);
      setService(fetchedService);
      setIsLoading(false);
    }
  }, [params.serviceId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (service === null) { // Explicitly null means not found after loading
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" /> Service Not Found
            </CardTitle>
            <CardDescription>The service you are trying to edit does not exist or could not be loaded from Local Storage.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard/admin/services" passHref>
              <Button variant="outline">Back to Service List</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If service is defined (found)
  return (
    <div className="container mx-auto py-8">
      <HospitalForm
        hospital={undefined}
        doctors={[]}
        services={[]}
        isOpen={true}
        onOpenChange={() => {}}
        onFormSubmitSuccess={() => {}}
      />
    </div>
  );
}
