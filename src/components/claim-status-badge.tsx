
import type { ClaimStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Info, XCircle, Building, FileText, User, Hash, LogIn, LogOut, FileUp } from 'lucide-react';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
}

const getStatusVisuals = (claimStage: string): { icon: React.ElementType, colorClass: string, badgeVariant: "default" | "secondary" | "destructive" | "outline" } => {
  const stageLower = claimStage.toLowerCase();

  if (stageLower.includes('settled') || stageLower.includes('approved') || stageLower.includes('processed') || stageLower.includes('completed')) {
    return { icon: CheckCircle2, colorClass: 'text-green-500', badgeVariant: 'default' };
  }
  if (stageLower.includes('admitted')) {
    return { icon: LogIn, colorClass: 'text-primary', badgeVariant: 'secondary' };
  }
  if (stageLower.includes('discharged')) {
    return { icon: LogOut, colorClass: 'text-slate-500', badgeVariant: 'outline' };
  }
  if (stageLower.includes('file submitted') || stageLower.includes('submitted')) {
    return { icon: FileUp, colorClass: 'text-sky-500', badgeVariant: 'secondary' };
  }
  if (stageLower.includes('in review') || stageLower.includes('pending')) {
    return { icon: Clock, colorClass: 'text-amber-500', badgeVariant: 'outline' };
  }
  if (stageLower.includes('denied') || stageLower.includes('rejected')) {
    return { icon: XCircle, colorClass: 'text-red-500', badgeVariant: 'destructive' };
  }
  // Default for "Information Requested" or other specific stages
  if (stageLower.includes('information requested')) {
    return { icon: Info, colorClass: 'text-yellow-500', badgeVariant: 'outline' };
  }
  return { icon: Info, colorClass: 'text-muted-foreground', badgeVariant: 'outline' }; // Fallback
};

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const { icon: StatusIcon, colorClass, badgeVariant } = getStatusVisuals(status.claimStage);

  return (
    <Card className="w-full shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <StatusIcon className={`mr-2 h-6 w-6 ${colorClass}`} aria-hidden="true" />
          Claim Status: <Badge variant={badgeVariant} className={`ml-2 text-sm ${badgeVariant === 'default' ? 'bg-green-500 hover:bg-green-600 text-white' : ''} ${badgeVariant === 'destructive' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}>{status.claimStage}</Badge>
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
