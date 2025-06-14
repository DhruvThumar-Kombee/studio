
"use client";

import type { ClaimReportItem } from '@/types';
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
import { ScrollArea } from '@/components/ui/scroll-area';

interface TotalClaimsReportTableProps {
  data: ClaimReportItem[];
}

export function TotalClaimsReportTable({ data }: TotalClaimsReportTableProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No claims data to display for the selected filters.</p>;
  }

  return (
    <ScrollArea className="max-h-[600px] w-full border rounded-md shadow">
      <Table>
        <TableCaption>Total Claims Report</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Claim No.</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Policy No.</TableHead>
            <TableHead>Admission Date</TableHead>
            <TableHead>Stage</TableHead>
            {/* <TableHead className="text-right">Amount (₹)</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.claimNumber}</TableCell>
              <TableCell>{item.patientName}</TableCell>
              <TableCell>{item.hospitalName}</TableCell>
              <TableCell>{item.policyNumber}</TableCell>
              <TableCell>{item.admissionDate}</TableCell>
              <TableCell><Badge variant="outline">{item.claimStage}</Badge></TableCell>
              {/* <TableCell className="text-right">{item.totalAmount ? item.totalAmount.toLocaleString('en-IN') : 'N/A'}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
