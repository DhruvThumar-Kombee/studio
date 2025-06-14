
import { TPATable } from "@/components/dashboard/tpas/TPATable";
import { getTPAsAction } from "@/actions/tpaMasterActions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldAlert } from 'lucide-react'; // Using ShieldAlert for TPA context

export default async function TPAMasterPage() {
  const tpas = await getTPAsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <ShieldAlert className="mr-3 h-8 w-8" /> TPA Master
        </h1>
        <p className="text-muted-foreground">Manage Third-Party Administrator (TPA) details.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>TPA List</CardTitle>
          <CardDescription>View, add, edit, or change the status of TPAs.</CardDescription>
        </CardHeader>
        <CardContent>
          <TPATable 
            initialTPAs={tpas} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure data is fresh on each request
