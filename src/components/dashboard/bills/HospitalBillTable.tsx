
"use client";

import * as React from 'react';
import type { HospitalBillReport, HospitalBillEntry } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
  TableCaption
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HospitalBillTableProps {
  reportData: HospitalBillReport;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const getPaymentStatusVariant = (status: HospitalBillEntry['paymentStatus']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Received':
      return 'default'; // Typically green or primary
    case 'Pending':
      return 'outline'; // Yellow or orange
    case 'Partially Paid':
      return 'secondary'; // Blue or another distinct color
    default:
      return 'outline';
  }
};
const getPaymentStatusColor = (status: HospitalBillEntry['paymentStatus']): string => {
    switch (status) {
        case 'Received': return 'bg-green-500 hover:bg-green-600 text-white';
        case 'Pending': return 'bg-yellow-400 hover:bg-yellow-500 text-black';
        case 'Partially Paid': return 'bg-blue-500 hover:bg-blue-600 text-white';
        default: return '';
    }
}


const HospitalBillTable = React.forwardRef<HTMLDivElement, HospitalBillTableProps>(
  ({ reportData }, ref) => {
    if (!reportData || reportData.entries.length === 0) {
      return null; // Or a message saying no data, handled by parent
    }

    return (
      <div ref={ref} className="border rounded-lg p-4 shadow-md bg-card">
        <h2 className="text-xl font-semibold text-primary mb-1">
          Bill Report: {reportData.hospitalName}
        </h2>
        <p className="text-sm text-muted-foreground mb-1">
          For period: {reportData.dateFrom} to {reportData.dateTo}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Reference Person: {reportData.referencePerson}
        </p>

        <ScrollArea className="max-h-[600px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Services</TableHead>
                <TableHead className="text-right">Total Bill (₹)</TableHead>
                <TableHead>Comm. Type</TableHead>
                <TableHead className="text-right">Comm. Rate</TableHead>
                <TableHead className="text-right">Commission (₹)</TableHead>
                <TableHead className="text-right">Net to Hospital (₹)</TableHead>
                <TableHead>Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.entries.map((entry) => (
                <TableRow key={entry.admissionId}>
                  <TableCell>{entry.patientName}</TableCell>
                  <TableCell>{entry.admissionDate}</TableCell>
                  <TableCell className="text-xs">
                    {entry.servicesDetails.map(s => `${s.name} (${formatCurrency(s.price)})`).join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.totalServiceAmount)}</TableCell>
                  <TableCell>{entry.commissionType}</TableCell>
                  <TableCell className="text-right">{entry.commissionType === 'Percentage' ? `${entry.commissionRate}%` : formatCurrency(entry.commissionRate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.calculatedCommission)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.netAmountToHospital)}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={getPaymentStatusVariant(entry.paymentStatus)}
                        className={getPaymentStatusColor(entry.paymentStatus)}
                    >
                        {entry.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={3} className="text-right">Totals:</TableCell>
                <TableCell className="text-right">{formatCurrency(reportData.summary.totalBillAmount)}</TableCell>
                <TableCell colSpan={2}></TableCell>
                <TableCell className="text-right">{formatCurrency(reportData.summary.totalCommission)}</TableCell>
                <TableCell className="text-right">{formatCurrency(reportData.summary.totalNetToHospital)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </ScrollArea>
        <TableCaption className="mt-4">End of Report for {reportData.hospitalName}</TableCaption>
      </div>
    );
  }
);

HospitalBillTable.displayName = "HospitalBillTable";

export { HospitalBillTable };
