
'use server';
import type { Employee, EmployeeFormInput } from '@/types';
import { mockEmployees } from '@/lib/mock-data'; // Assuming mockEmployees is in mock-data.ts

// Ensure mockEmployeesDB is initialized on the global object for HMR persistence
if (!(global as any).mockEmployeesDB) {
  (global as any).mockEmployeesDB = JSON.parse(JSON.stringify(mockEmployees));
}

let employeesDB: Employee[] = (global as any).mockEmployeesDB;

export async function getAllEmployees(): Promise<Employee[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  // Return a fresh copy, sorted
  const currentDB = (global as any).mockEmployeesDB as Employee[];
  return JSON.parse(JSON.stringify(currentDB.sort((a, b) => a.name.localeCompare(b.name))));
}

export async function getEmployeeById(employeeId: string): Promise<Employee | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const currentDB = (global as any).mockEmployeesDB as Employee[];
  const employee = currentDB.find(e => e.id === employeeId);
  return employee ? JSON.parse(JSON.stringify(employee)) : null;
}

export async function addEmployee(employeeData: Omit<Employee, 'id' | 'isActive'>): Promise<Employee> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const currentDB = (global as any).mockEmployeesDB as Employee[];
  // Simulate unique name check (case-insensitive for example)
  const existingEmployeeByName = currentDB.find(
    (emp) => emp.name.toLowerCase() === employeeData.name.toLowerCase()
  );
  if (existingEmployeeByName) {
    throw new Error(`An employee with the name "${employeeData.name}" already exists.`);
  }

  const newEmployee: Employee = {
    ...employeeData,
    id: `emp-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    isActive: true, // New employees are active by default
  };
  currentDB.push(newEmployee);
  (global as any).mockEmployeesDB = currentDB; // Persist change to global
  return JSON.parse(JSON.stringify(newEmployee));
}

export async function updateEmployee(employeeId: string, updates: Partial<EmployeeFormInput>): Promise<Employee | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const currentDB = (global as any).mockEmployeesDB as Employee[];
  const employeeIndex = currentDB.findIndex(e => e.id === employeeId);
  if (employeeIndex === -1) {
    return null;
  }

  // Simulate unique name check if name is being updated
  if (updates.name && updates.name.toLowerCase() !== currentDB[employeeIndex].name.toLowerCase()) {
    const existingEmployeeByName = currentDB.find(
      (emp) => emp.name.toLowerCase() === updates.name!.toLowerCase() && emp.id !== employeeId
    );
    if (existingEmployeeByName) {
      throw new Error(`Another employee with the name "${updates.name}" already exists.`);
    }
  }
  
  currentDB[employeeIndex] = { ...currentDB[employeeIndex], ...updates } as Employee;
  (global as any).mockEmployeesDB = currentDB; // Persist change to global
  return JSON.parse(JSON.stringify(currentDB[employeeIndex]));
}

export async function deleteEmployee(employeeId: string): Promise<boolean> {
  // This performs a soft delete (marks as inactive)
  await new Promise(resolve => setTimeout(resolve, 300));
  const currentDB = (global as any).mockEmployeesDB as Employee[];
  const employeeIndex = currentDB.findIndex(e => e.id === employeeId);
  if (employeeIndex === -1 || !currentDB[employeeIndex].isActive) {
    return false; // Cannot deactivate a non-existent or already inactive employee
  }
  currentDB[employeeIndex].isActive = false;
  (global as any).mockEmployeesDB = currentDB; // Persist change to global
  return true;
}

// Function to toggle employee status (activate/deactivate)
export async function toggleEmployeeStatus(employeeId: string): Promise<Employee | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const currentDB = (global as any).mockEmployeesDB as Employee[];
  const employeeIndex = currentDB.findIndex(e => e.id === employeeId);
  if (employeeIndex === -1) {
    return null;
  }
  currentDB[employeeIndex].isActive = !currentDB[employeeIndex].isActive;
  (global as any).mockEmployeesDB = currentDB; // Persist change to global
  return JSON.parse(JSON.stringify(currentDB[employeeIndex]));
}
