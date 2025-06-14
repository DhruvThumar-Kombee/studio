
"use client";

import * as React from 'react';
import type { BalanceSummary as BalanceSummaryType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOverallBalanceSummaryAction } from '@/actions/transactionActions'; // For refresh

interface BalanceSummaryProps {
  initialSummary: BalanceSummaryType;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

export function BalanceSummary({ initialSummary }: BalanceSummaryProps) {
  const [summary, setSummary] = React.useState<BalanceSummaryType>(initialSummary);

  // This effect could be used if you have a refresh button or other trigger
  // For now, it updates if the initialSummary prop changes (e.g., after a revalidation)
  React.useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  // Example refresh function (could be tied to a button if needed)
  // const refreshSummary = async () => {
  //   const newSummary = await getOverallBalanceSummaryAction();
  //   setSummary(newSummary);
  // };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Overall Financial Summary</CardTitle>
        <CardDescription>A snapshot of your total income, expenses, and net balance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <StatItem 
            title="Total Income" 
            value={formatCurrency(summary.totalIncome)} 
            icon={ArrowUpCircle} 
            iconColor="text-green-500"
          />
          <StatItem 
            title="Total Expenses" 
            value={formatCurrency(summary.totalExpenses)} 
            icon={ArrowDownCircle} 
            iconColor="text-red-500"
          />
          <StatItem 
            title="Net Balance" 
            value={formatCurrency(summary.netBalance)} 
            icon={Scale} 
            iconColor={summary.netBalance >= 0 ? "text-blue-500" : "text-orange-500"}
            valueColor={summary.netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface StatItemProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor?: string;
  valueColor?: string;
}

function StatItem({ title, value, icon: Icon, iconColor, valueColor }: StatItemProps) {
  return (
    <div className="p-4 bg-muted/30 rounded-lg flex items-center space-x-3">
      <Icon className={cn("h-8 w-8", iconColor || "text-muted-foreground")} />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className={cn("text-2xl font-semibold", valueColor || "text-foreground")}>{value}</p>
      </div>
    </div>
  );
}
