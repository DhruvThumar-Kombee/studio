
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTable } from "@/components/dashboard/transactions/TransactionTable";
import { BalanceSummary } from "@/components/dashboard/transactions/BalanceSummary";
import { getTransactionsAction, getOverallBalanceSummaryAction } from "@/actions/transactionActions";
import { Landmark } from "lucide-react";

export default async function TransactionsPage() {
  const [transactions, balanceSummary] = await Promise.all([
    getTransactionsAction(),
    getOverallBalanceSummaryAction()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Landmark className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Expense & Income</h1>
          <p className="text-muted-foreground">Manage financial transactions and view balance summaries.</p>
        </div>
      </div>
      
      <BalanceSummary initialSummary={balanceSummary} />

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View, add, edit, or delete financial transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionTable 
            initialTransactions={transactions} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure data is fresh on each request
