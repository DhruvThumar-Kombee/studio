
'use server';
import type { Employee, EmployeeFormInput } from '@/types';
import { mockEmployees } from '@/lib/mock-data'; // Assuming mockEmployees is in mock-data.ts

let employeesDB: Employee[] = JSON.parse(JSON.stringify(mockEmployees));

export async function getAllEmployees(): Promise<Employee[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(employeesDB.sort((a, b) => a.name.localeCompare(b.name))));
}

export async function getEmployeeById(employeeId: string): Promise<Employee | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const employee = employeesDB.find(e => e.id === employeeId);
  return employee ? JSON.parse(JSON.stringify(employee)) : null;
}

export async function addEmployee(employeeData: Omit<Employee, 'id' | 'isActive'>): Promise<Employee> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simulate unique name check (case-insensitive for example)
  const existingEmployeeByName = employeesDB.find(
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
  employeesDB.push(newEmployee);
  return JSON.parse(JSON.stringify(newEmployee));
}

export async function updateEmployee(employeeId: string, updates: Partial<EmployeeFormInput>): Promise<Employee | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const employeeIndex = employeesDB.findIndex(e => e.id === employeeId);
  if (employeeIndex === -1) {
    return null;
  }

  // Simulate unique name check if name is being updated
  if (updates.name && updates.name.toLowerCase() !== employeesDB[employeeIndex].name.toLowerCase()) {
    const existingEmployeeByName = employeesDB.find(
      (emp) => emp.name.toLowerCase() === updates.name!.toLowerCase() && emp.id !== employeeId
    );
    if (existingEmployeeByName) {
      throw new Error(`Another employee with the name "${updates.name}" already exists.`);
    }
  }
  
  employeesDB[employeeIndex] = { ...employeesDB[employeeIndex], ...updates } as Employee;
  return JSON.parse(JSON.stringify(employeesDB[employeeIndex]));
}

export async function deleteEmployee(employeeId: string): Promise<boolean> {
  // This performs a soft delete (marks as inactive)
  await new Promise(resolve => setTimeout(resolve, 300));
  const employeeIndex = employeesDB.findIndex(e => e.id === employeeId);
  if (employeeIndex === -1 || !employeesDB[employeeIndex].isActive) {
    return false; // Cannot deactivate a non-existent or already inactive employee
  }
  employeesDB[employeeIndex].isActive = false;
  return true;
}

// Function to toggle employee status (activate/deactivate)
export async function toggleEmployeeStatus(employeeId: string): Promise<Employee | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const employeeIndex = employeesDB.findIndex(e => e.id === employeeId);
  if (employeeIndex === -1) {
    return null;
  }
  employeesDB[employeeIndex].isActive = !employeesDB[employeeIndex].isActive;
  return JSON.parse(JSON.stringify(employeesDB[employeeIndex]));
}
