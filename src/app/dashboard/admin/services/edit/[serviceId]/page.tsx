
import { ServiceForm } from '@/components/dashboard/services/ServiceForm';
import { getAllServicesAdmin } from '@/services/serviceMasterService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getServiceById(serviceId: string) {
    const allServices = await getAllServicesAdmin(); 
    return allServices.find(s => s.id === serviceId) || null;
}

export default async function EditServicePage({ params }: { params: { serviceId: string } }) {
  const service = await getServiceById(params.serviceId);

  if (!service) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" /> Service Not Found
            </CardTitle>
            <CardDescription>The service you are trying to edit does not exist or could not be loaded.</CardDescription>
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

  return (
    <div className="container mx-auto py-8">
      <ServiceForm service={service} />
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request for editing
