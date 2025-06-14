
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Filter } from "lucide-react";
// import { DateRangePicker } from "@/components/ui/date-range-picker"; // Future component
import * as React from "react";
import { mockClaimsData } from "@/lib/mock-data"; // Import the data to be exported
import type { ClaimStatus } from "@/types";

export function DashboardFilters() {
  const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined } | undefined>();

  const handleExport = () => {
    const claimsToExport: ClaimStatus[] = mockClaimsData; // Use the imported data

    if (claimsToExport.length === 0) {
      console.log("No data to export.");
      // Optionally, show a toast or alert to the user
      return;
    }

    // Define CSV headers - use keys from the first item as a basis
    const headers = Object.keys(claimsToExport[0]);
    
    // Convert array of objects to CSV string
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n"; // Add header row

    claimsToExport.forEach(claim => {
      const row = headers.map(header => {
        let cellData = (claim as any)[header];
        // Handle cases where data might be null/undefined or needs escaping
        if (cellData === null || cellData === undefined) {
          cellData = "";
        } else if (typeof cellData === 'string' && (cellData.includes(',') || cellData.includes('"') || cellData.includes('\n'))) {
          // Escape double quotes by doubling them and wrap in double quotes
          cellData = `"${cellData.replace(/"/g, '""')}"`;
        }
        return cellData;
      }).join(",");
      csvContent += row + "\r\n";
    });

    // Create a link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "claims_export.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };
  
  // Default to last 30 days
  React.useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    setDateRange({ from, to });
  }, []);


  return (
    <Card className="mb-6">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 flex-grow">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        {/* Placeholder for Date Range Picker */}
        <div className="text-sm p-2 border rounded-md bg-secondary text-secondary-foreground w-full sm:w-auto text-center">
          Date Range Picker (Coming Soon) <br/>
          {dateRange?.from?.toLocaleDateString()} - {dateRange?.to?.toLocaleDateString()}
        </div>

        <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </CardContent>
    </Card>
  );
}
