
'use server';

import {
  getAllEmployees,
  addEmployee as addEmployeeService,
  updateEmployee as updateEmployeeService,
  deleteEmployee as deleteEmployeeService,
  toggleEmployeeStatus as toggleEmployeeStatusService,
  getEmployeeById as getEmployeeByIdService,
} from '@/services/employeeService';
import type { Employee, EmployeeFormInput } from '@/types';
import { EmployeeSchema } from '@/lib/schemas/employeeSchemas';
import type { ActionResponse } from '@/lib/schemas/serviceSchemas';
import { revalidatePath } from 'next/cache';

const EMPLOYEES_ADMIN_PATH = '/dashboard/admin/employees';

export async function getEmployeesAction(): Promise<Employee[]> {
  return getAllEmployees();
}

export async function getEmployeeByIdAction(id: string): Promise<Employee | null> {
    return getEmployeeByIdService(id);
}

export async function createEmployeeAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<Employee>> {
  const rawFormData = {
    name: formData.get('name') as string,
    role: formData.get('role') as EmployeeFormInput['role'],
    contact: formData.get('contact') as string | undefined,
  };

  const validationResult = EmployeeSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed. Please check the fields.",
      errors: validationResult.error.issues,
    };
  }

  try {
    // The service function `addEmployeeService` expects Omit<Employee, 'id' | 'isActive'>
    // `validationResult.data` matches `EmployeeFormInput` (which is Omit<Employee, 'id'> if isActive is not passed)
    // We explicitly cast here to ensure the service gets what it expects,
    // as `isActive` is handled by the service (defaults to true).
    const newEmployee = await addEmployeeService(validationResult.data as Omit<Employee, 'id' | 'isActive'>);
    revalidatePath(EMPLOYEES_ADMIN_PATH);
    return {
      success: true,
      data: newEmployee,
      message: "Employee created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create employee.",
    };
  }
}

export async function updateEmployeeAction(
  employeeId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResponse<Employee>> {
  const rawFormData: EmployeeFormInput = {
    name: formData.get('name') as string,
    role: formData.get('role') as EmployeeFormInput['role'],
    contact: formData.get('contact') as string | undefined,
    isActive: formData.get('isActive') === 'true', // Convert string from FormData to boolean
  };
  
  const validationResult = EmployeeSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed. Please check the fields.",
      errors: validationResult.error.issues,
    };
  }

  try {
    const updatedEmployee = await updateEmployeeService(employeeId, validationResult.data);
    if (!updatedEmployee) {
      return { success: false, message: "Employee not found." };
    }
    revalidatePath(EMPLOYEES_ADMIN_PATH);
    return {
      success: true,
      data: updatedEmployee,
      message: "Employee updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update employee.",
    };
  }
}

export async function deleteEmployeeAction(employeeId: string): Promise<ActionResponse<null>> {
  // This is a soft delete (marks as inactive)
  try {
    const success = await deleteEmployeeService(employeeId);
    if (!success) {
      return { success: false, message: "Employee not found or already inactive." };
    }
    revalidatePath(EMPLOYEES_ADMIN_PATH);
    return { success: true, message: "Employee deactivated successfully." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to deactivate employee.",
    };
  }
}

export async function toggleEmployeeStatusAction(employeeId: string): Promise<ActionResponse<Employee>> {
  try {
    const updatedEmployee = await toggleEmployeeStatusService(employeeId);
    if (!updatedEmployee) {
      return { success: false, message: "Employee not found." };
    }
    revalidatePath(EMPLOYEES_ADMIN_PATH);
    return {
      success: true,
      data: updatedEmployee,
      message: `Employee status updated to ${updatedEmployee.isActive ? 'Active' : 'Inactive'}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to toggle employee status.",
    };
  }
}
