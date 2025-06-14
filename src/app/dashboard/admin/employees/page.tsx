
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTable } from "@/components/dashboard/employees/EmployeeTable";
import { getEmployeesAction } from "@/actions/employeeActions";
import { Users2 } from "lucide-react"; // Icon for Employee Management

export default async function EmployeeManagementPage() {
  const employees = await getEmployeesAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Employee Management</h1>
          <p className="text-muted-foreground">Manage employee details, roles, and status.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>View, add, edit, or change the status of employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable 
            initialEmployees={employees} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure data is fresh on each request
