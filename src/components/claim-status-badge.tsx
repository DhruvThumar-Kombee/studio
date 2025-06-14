import type { ClaimStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Info, XCircle, Building, FileText, User, Hash } from 'lucide-react';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
}

const getStatusVisuals = (claimStage: string): { icon: React.ElementType, color: string, variant: "default" | "secondary" | "destructive" | "outline" } => {
  const stageLower = claimStage.toLowerCase();
  if (stageLower.includes('approved') || stageLower.includes('processed') || stageLower.includes('completed')) {
    return { icon: CheckCircle, color: 'text-green-600', variant: 'default' };
  }
  if (stageLower.includes('pending') || stageLower.includes('review') || stageLower.includes('submitted')) {
    return { icon: Clock, color: 'text-blue-600', variant: 'secondary' };
  }
  if (stageLower.includes('denied') || stageLower.includes('rejected')) {
    return { icon: XCircle, color: 'text-red-600', variant: 'destructive' };
  }
  return { icon: Info, color: 'text-yellow-600', variant: 'outline' }; // Default/Information Requested
};

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const { icon: StatusIcon, color: iconColor, variant: badgeVariant } = getStatusVisuals(status.claimStage);

  return (
    <Card className="w-full shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <StatusIcon className={`mr-2 h-6 w-6 ${iconColor}`} aria-hidden="true" />
          Claim Status: <Badge variant={badgeVariant} className="ml-2 text-sm">{status.claimStage}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm md:text-base">
        {status.hospitalName && (
          <div className="flex items-center">
            <Building className="mr-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <strong>Hospital:</strong><span className="ml-2">{status.hospitalName}</span>
          </div>
        )}
        {status.claimNumber && (
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <strong>Claim Number:</strong><span className="ml-2">{status.claimNumber}</span>
          </div>
        )}
        {status.policyNumber && (
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <strong>Policy Number:</strong><span className="ml-2">{status.policyNumber}</span>
          </div>
        )}
        {status.patientName && (
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <strong>Patient Name:</strong><span className="ml-2">{status.patientName}</span>
          </div>
        )}
        <div className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <strong>Status Date:</strong><span className="ml-2">{status.statusDate}</span>
        </div>
        <div className="flex items-center">
          <Hash className="mr-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <strong>Reference No:</strong><span className="ml-2">{status.referenceNo}</span>
        </div>
      </CardContent>
    </Card>
  );
}
