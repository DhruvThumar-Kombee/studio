'use client';

import * as React from 'react';
import type { Service } from '@/types';
import type { ServiceFormInput } from '@/lib/schemas/serviceSchemas';
import { getClientServices, toggleClientServiceStatus } from '@/lib/clientServiceManager';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, EyeOff, Trash2 } from 'lucide-react'; // Trash2 for "Deactivate"
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ServiceTableProps {
 // initialServices prop removed, data will be fetched client-side
}

export function ServiceTable({}: ServiceTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [showToggleStatusDialog, setShowToggleStatusDialog] = React.useState(false);
  const [serviceToToggleStatus, setServiceToToggleStatus] = React.useState<Service | null>(null);

  const fetchAndSetServices = React.useCallback(() => {
    setIsLoading(true);
    const data = getClientServices();
    setServices(data);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchAndSetServices();
  }, [fetchAndSetServices]);

  const handleEdit = (serviceId: string) => {
    router.push(`/dashboard/admin/services/edit/${serviceId}`);
  };

  const openToggleStatusDialog = (service: Service) => {
    setServiceToToggleStatus(service);
    setShowToggleStatusDialog(true);
  };

  const confirmToggleStatus = () => {
    if (!serviceToToggleStatus) return;
    
    const updatedService = toggleClientServiceStatus(serviceToToggleStatus.id);
    setShowToggleStatusDialog(false);

    if (updatedService) {
      toast({ title: "Success", description: `Service status updated to ${updatedService.isActive ? 'Active' : 'Inactive'}.` });
      fetchAndSetServices(); // Refresh list
    } else {
      toast({ title: "Error", description: "Failed to toggle service status or service not found.", variant: "destructive" });
    }
    setServiceToToggleStatus(null);
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return 'N/A';
    return `₹${price.toLocaleString()}`;
  };

  const renderPriceDetails = (service: Service) => {
    if (service.priceType === 'Fixed') {
      return formatPrice(service.fixedPrice);
    }
    if (service.priceType === 'Slab-Based' && service.slabs) {
      return `Base: ${formatPrice(service.slabs.basePrice)} (up to ${formatPrice(service.slabs.baseLimit)}), then ${formatPrice(service.slabs.additionalPricePerSlab)} per ${formatPrice(service.slabs.slabSize)}`;
    }
    return 'N/A';
  };

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Loading services...</p>;
  }

  if (!services || services.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No services found. Add a new service to get started.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Name</TableHead>
            <TableHead>Price Type</TableHead>
            <TableHead>Price Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{service.priceType}</TableCell>
              <TableCell className="text-xs max-w-xs truncate">{renderPriceDetails(service)}</TableCell>
              <TableCell>
                <Badge variant={service.isActive ? 'default' : 'outline'} 
                       className={service.isActive ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-destructive text-destructive'}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(service.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openToggleStatusDialog(service)}>
                      {service.isActive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                      {service.isActive ? 'Set Inactive' : 'Set Active'}
                    </DropdownMenuItem>
                    {/* The "Deactivate" action is essentially "Set Inactive" */}
                    {service.isActive && (
                        <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => openToggleStatusDialog(service)} // Re-using toggle for "Deactivate"
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate 
                        </DropdownMenuItem>
                        </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={showToggleStatusDialog} onOpenChange={setShowToggleStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Status Change: "{serviceToToggleStatus?.name || ''}"
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set this service to {serviceToToggleStatus?.isActive ? 'Inactive' : 'Active'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToToggleStatus(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmToggleStatus}
              className={serviceToToggleStatus?.isActive ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}
            >
              {serviceToToggleStatus?.isActive ? 'Set Inactive' : 'Set Active'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
