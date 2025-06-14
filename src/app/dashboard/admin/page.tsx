
"use client"; 

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { ClaimStagePieChart } from "@/components/dashboard/ClaimStagePieChart";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { mockClaimsData, hospitals } from "@/lib/mock-data"; // Direct import for client component
import type { ClaimStatus, ClaimStageKpi } from "@/types";
import { Briefcase, CheckCircle, Users, Activity, FileText } from 'lucide-react'; // Added more icons

interface ClaimStageData {
  name: ClaimStageKpi;
  value: number;
}

export default function AdminDashboardPage() {
  const [claims, setClaims] = useState<ClaimStatus[]>([]);
  
  useEffect(() => {
    // In a real app, you'd fetch this data. For now, using mock.
    // Applying a timeout to simulate async data fetching
    const timer = setTimeout(() => {
        setClaims(mockClaimsData);
    }, 500); // Simulate 0.5 second delay
    return () => clearTimeout(timer);
  }, []);

  const totalClaims = claims.length;
  const settledClaims = claims.filter(claim => claim.claimStage === 'Settled').length;
  
  const inProcessStages: string[] = ["Admitted", "Discharged", "Submitted", "Received"];
  const inProcessClaims = claims.filter(claim => inProcessStages.includes(claim.claimStage)).length;
  
  const hospitalCount = hospitals.length;

  const claimStageData = useMemo(() => {
    const counts: Record<ClaimStageKpi, number> = {
      Admitted: 0,
      Discharged: 0,
      Submitted: 0,
      Received: 0,
      Settled: 0,
    };
    claims.forEach(claim => {
      if (kpiClaimStages.includes(claim.claimStage as ClaimStageKpi)) {
        counts[claim.claimStage as ClaimStageKpi]++;
      }
    });
    return kpiClaimStages.map(stage => ({ name: stage, value: counts[stage] })) as ClaimStageData[];
  }, [claims]);
  
  const kpiClaimStages: ClaimStageKpi[] = ["Admitted", "Discharged", "Submitted", "Received", "Settled"];


  if (claims.length === 0) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      )
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        {/* Future global actions like "Add New Claim" can go here */}
      </div>
      
      <DashboardFilters />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Claims" value={totalClaims} icon={Briefcase} description="All claims in the system" />
        <StatCard title="Claims Settled" value={settledClaims} icon={CheckCircle} description="Successfully processed claims" />
        <StatCard title="Claims In Process" value={inProcessClaims} icon={Activity} description="Claims currently being handled" />
        <StatCard title="Registered Hospitals" value={hospitalCount} icon={Users} description="Total affiliated hospitals" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ClaimStagePieChart data={claimStageData} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Overview of recent claim submissions and updates.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent activity feed or list */}
            <p className="text-muted-foreground">Recent activity feed will be displayed here.</p>
            {claims.slice(0, 5).map(claim => (
              <div key={claim.referenceNo} className="text-sm py-1 border-b last:border-b-0">
                <span className="font-medium">{claim.patientName || claim.claimNumber || "N/A"}</span> - {claim.claimStage} on {new Date(claim.statusDate).toLocaleDateString()}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder for detailed data tables */}
      <Card>
        <CardHeader>
          <CardTitle>Claims Management Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed claim listings, hospital management, and master data configuration will be available here.</p>
        </CardContent>
      </Card>

    </div>
  );
}
