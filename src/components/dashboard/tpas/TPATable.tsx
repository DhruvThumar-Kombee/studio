
'use client';

import * as React from 'react';
import type { TPA } from '@/types';
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
import { MoreHorizontal, Edit, Eye, EyeOff, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteTPAAction, toggleTPAStatusAction, getTPAsAction } from '@/actions/tpaMasterActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TPAForm } from './TPAForm';

interface TPATableProps {
  initialTPAs: TPA[];
}

export function TPATable({ initialTPAs }: TPATableProps) {
  const { toast } = useToast();
  const [tpas, setTPAs] = React.useState<TPA[]>(initialTPAs);
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTPA, setEditingTPA] = React.useState<TPA | null>(null);
  
  const [showDeactivateDialog, setShowDeactivateDialog] = React.useState(false);
  const [tpaToDeactivate, setTPAToDeactivate] = React.useState<TPA | null>(null);

  const [showToggleStatusDialog, setShowToggleStatusDialog] = React.useState(false);
  const [tpaToToggleStatus, setTPAToToggleStatus] = React.useState<TPA | null>(null);

  const refreshTPAs = async () => {
    try {
      const updatedTPAs = await getTPAsAction();
      setTPAs(updatedTPAs);
    } catch (error) {
      toast({ title: "Error", description: "Failed to refresh TPA list.", variant: "destructive" });
    }
  };

  React.useEffect(() => {
    setTPAs(initialTPAs);
  }, [initialTPAs]);

  const handleFormSubmitSuccess = () => {
    refreshTPAs(); // Refresh data after form submission
  };

  const handleAddNew = () => {
    setEditingTPA(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (tpa: TPA) => {
    setEditingTPA(tpa);
    setIsFormOpen(true);
  };

  const openDeactivateDialog = (tpa: TPA) => {
    setTPAToDeactivate(tpa);
    setShowDeactivateDialog(true);
  };

  const confirmDeactivate = async () => {
    if (!tpaToDeactivate) return;
    setShowDeactivateDialog(false);
    const result = await deleteTPAAction(tpaToDeactivate.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      refreshTPAs();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setTPAToDeactivate(null);
  };

  const openToggleStatusDialog = (tpa: TPA) => {
    setTPAToToggleStatus(tpa);
    setShowToggleStatusDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!tpaToToggleStatus) return;
    setShowToggleStatusDialog(false);
    const result = await toggleTPAStatusAction(tpaToToggleStatus.id, tpaToToggleStatus.isActive);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      refreshTPAs();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setTPAToToggleStatus(null);
  };

  if (!tpas || tpas.length === 0) {
    return (
       <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No TPAs found. Add a new TPA to get started.</p>
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New TPA
        </Button>
        {isFormOpen && (
          <TPAForm
            tpa={editingTPA}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onFormSubmitSuccess={handleFormSubmitSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New TPA
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Mobile</TableHead>
            <TableHead className="hidden lg:table-cell">Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tpas.map((tpa) => (
            <TableRow key={tpa.id}>
              <TableCell className="font-medium">{tpa.name}</TableCell>
              <TableCell className="hidden md:table-cell">{tpa.email || 'N/A'}</TableCell>
              <TableCell className="hidden md:table-cell">{tpa.mobile || 'N/A'}</TableCell>
              <TableCell className="hidden lg:table-cell text-xs max-w-xs truncate">{tpa.address || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={tpa.isActive ? 'default' : 'outline'} 
                       className={tpa.isActive ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-destructive text-destructive'}>
                  {tpa.isActive ? 'Active' : 'Inactive'}
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
                    <DropdownMenuItem onClick={() => handleEdit(tpa)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openToggleStatusDialog(tpa)}>
                      {tpa.isActive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                      {tpa.isActive ? 'Set Inactive' : 'Set Active'}
                    </DropdownMenuItem>
                    {tpa.isActive && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDeactivateDialog(tpa)} 
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

      {isFormOpen && (
          <TPAForm
            tpa={editingTPA}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onFormSubmitSuccess={handleFormSubmitSuccess}
          />
        )}

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to deactivate this TPA?</AlertDialogTitle>
            <AlertDialogDescription>
              TPA: "{tpaToDeactivate?.name || ''}"<br/>
              This will mark the TPA as inactive. It can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTPAToDeactivate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showToggleStatusDialog} onOpenChange={setShowToggleStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set the TPA "{tpaToToggleStatus?.name || ''}" to {tpaToToggleStatus?.isActive ? 'Inactive' : 'Active'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTPAToToggleStatus(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              {tpaToToggleStatus?.isActive ? 'Set Inactive' : 'Set Active'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
