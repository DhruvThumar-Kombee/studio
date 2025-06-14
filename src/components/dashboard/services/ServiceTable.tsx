
'use client';

import * as React from 'react';
import type { Service } from '@/types';
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
import { MoreHorizontal, Edit, Eye, EyeOff, Trash2 } from 'lucide-react'; // Added Trash2 for delete conceptual action
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { deleteServiceAction, updateServiceAction } from '@/actions/serviceMasterActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ServiceTableProps {
  services: Service[];
}

export function ServiceTable({ services: initialServices }: ServiceTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = React.useState<Service[]>(initialServices);
  
  // State for Deactivate/Delete Dialog (which is essentially deactivation)
  const [showDeactivateDialog, setShowDeactivateDialog] = React.useState(false);
  const [serviceToDeactivate, setServiceToDeactivate] = React.useState<Service | null>(null);

  // State for Toggle Active/Inactive Dialog
  const [showToggleStatusDialog, setShowToggleStatusDialog] = React.useState(false);
  const [serviceToToggleStatus, setServiceToToggleStatus] = React.useState<Service | null>(null);

  React.useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const handleEdit = (serviceId: string) => {
    router.push(`/dashboard/admin/services/edit/${serviceId}`);
  };

  const openDeactivateDialog = (service: Service) => {
    setServiceToDeactivate(service);
    setShowDeactivateDialog(true);
  };

  const confirmDeactivate = async () => {
    if (!serviceToDeactivate) return;

    // Optimistic update
    const originalServices = [...services];
    setServices(prevServices => prevServices.map(s => 
      s.id === serviceToDeactivate.id ? { ...s, isActive: false } : s
    ));
    
    setShowDeactivateDialog(false);
    const result = await deleteServiceAction(serviceToDeactivate.id);
    
    if (result.success) {
      toast({ title: "Success", description: result.message });
      // State already updated optimistically
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
      setServices(originalServices); // Revert on error
    }
    setServiceToDeactivate(null);
  };

  const openToggleStatusDialog = (service: Service) => {
    setServiceToToggleStatus(service);
    setShowToggleStatusDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!serviceToToggleStatus) return;

    const optimisticNewActiveState = !serviceToToggleStatus.isActive;
    const originalServices = [...services];

    // Optimistic update
    setServices(prevServices => prevServices.map(s => 
      s.id === serviceToToggleStatus.id ? { ...s, isActive: optimisticNewActiveState } : s
    ));
    
    setShowToggleStatusDialog(false);
    const result = await updateServiceAction(serviceToToggleStatus.id, { 
      ...serviceToToggleStatus, // pass all fields for validation
      isActive: optimisticNewActiveState 
    });

    if (result.success && result.data) {
      toast({ title: "Success", description: `Service status updated to ${result.data.isActive ? 'Active' : 'Inactive'}.` });
      // State already updated optimistically
    } else {
      toast({ title: "Error", description: result.message || "Failed to toggle service status.", variant: "destructive" });
      setServices(originalServices); // Revert on error
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
                    {service.isActive && ( // Only show "Deactivate" option if service is active
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDeactivateDialog(service)} 
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

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to deactivate this service?</AlertDialogTitle>
            <AlertDialogDescription>
              Service: "{serviceToDeactivate?.name || ''}"<br/>
              This will mark the service as inactive. It can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDeactivate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showToggleStatusDialog} onOpenChange={setShowToggleStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set the service "{serviceToToggleStatus?.name || ''}" to {serviceToToggleStatus?.isActive ? 'Inactive' : 'Active'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToToggleStatus(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              {serviceToToggleStatus?.isActive ? 'Set Inactive' : 'Set Active'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
