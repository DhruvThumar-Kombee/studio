
'use client';

import * as React from 'react';
import type { Employee } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Users2, Eye, EyeOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { deleteEmployeeAction, toggleEmployeeStatusAction, getEmployeesAction } from '@/actions/employeeActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmployeeForm } from './EmployeeForm';
import { cn } from '@/lib/utils';

interface EmployeeTableProps {
  initialEmployees: Employee[];
}

export function EmployeeTable({ initialEmployees }: EmployeeTableProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = React.useState<Employee[]>(initialEmployees);
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
  
  const [showDeactivateDialog, setShowDeactivateDialog] = React.useState(false);
  const [employeeToDeactivate, setEmployeeToDeactivate] = React.useState<Employee | null>(null);

  const [showToggleStatusDialog, setShowToggleStatusDialog] = React.useState(false);
  const [employeeToToggleStatus, setEmployeeToToggleStatus] = React.useState<Employee | null>(null);


  const refreshEmployees = async () => {
    try {
      const updatedEmployees = await getEmployeesAction();
      setEmployees(updatedEmployees);
    } catch (error) {
      toast({ title: "Error", description: "Failed to refresh employee list.", variant: "destructive" });
    }
  };

  React.useEffect(() => {
    setEmployees(initialEmployees);
  }, [initialEmployees]);

  const handleFormSubmitSuccess = () => {
    refreshEmployees();
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const openDeactivateDialog = (employee: Employee) => {
    setEmployeeToDeactivate(employee);
    setShowDeactivateDialog(true);
  };

  const confirmDeactivate = async () => {
    if (!employeeToDeactivate) return;
    setShowDeactivateDialog(false);
    const result = await deleteEmployeeAction(employeeToDeactivate.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      refreshEmployees();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setEmployeeToDeactivate(null);
  };

  const openToggleStatusDialog = (employee: Employee) => {
    setEmployeeToToggleStatus(employee);
    setShowToggleStatusDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!employeeToToggleStatus) return;
    setShowToggleStatusDialog(false);
    const result = await toggleEmployeeStatusAction(employeeToToggleStatus.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      refreshEmployees();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setEmployeeToToggleStatus(null);
  };


  if (!employees || employees.length === 0) {
    return (
       <div className="text-center py-8">
        <Users2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground mt-4 mb-4">No employees found. Add a new employee to get started.</p>
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Employee
        </Button>
        {isFormOpen && (
          <EmployeeForm
            employee={editingEmployee}
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
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Employee
        </Button>
      </div>
      <ScrollArea className="max-h-[600px] w-full rounded-md border">
        <Table>
          <TableCaption>A list of all employees.</TableCaption>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell className="hidden md:table-cell">{employee.contact || 'N/A'}</TableCell>
                <TableCell>
                  <Badge 
                    variant={employee.isActive ? 'default' : 'outline'}
                    className={cn(
                        employee.isActive ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-destructive text-destructive'
                    )}
                  >
                    {employee.isActive ? 'Active' : 'Inactive'}
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
                      <DropdownMenuItem onClick={() => handleEdit(employee)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => openToggleStatusDialog(employee)}>
                        {employee.isActive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {employee.isActive ? 'Set Inactive' : 'Set Active'}
                      </DropdownMenuItem>
                      {employee.isActive && ( // Only show Deactivate if employee is active
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeactivateDialog(employee)} 
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
      </ScrollArea>

      {isFormOpen && (
          <EmployeeForm
            employee={editingEmployee}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onFormSubmitSuccess={handleFormSubmitSuccess}
          />
        )}

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to deactivate this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              Employee: "{employeeToDeactivate?.name || ''}"<br/>
              This action will mark the employee as inactive. They can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDeactivate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showToggleStatusDialog} onOpenChange={setShowToggleStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set employee "{employeeToToggleStatus?.name || ''}" to {employeeToToggleStatus?.isActive ? 'Inactive' : 'Active'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToToggleStatus(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              {employeeToToggleStatus?.isActive ? 'Set Inactive' : 'Set Active'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
