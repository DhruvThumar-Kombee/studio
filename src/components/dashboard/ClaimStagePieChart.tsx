
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ClaimStageKpi } from '@/types';

interface ClaimStageData {
  name: ClaimStageKpi;
  value: number;
}

interface ClaimStagePieChartProps {
  data: ClaimStageData[];
}

const COLORS: Record<ClaimStageKpi, string> = {
  Admitted: 'hsl(var(--chart-1))',    // Blue
  Discharged: 'hsl(var(--chart-2))', // Green
  Submitted: 'hsl(var(--chart-3))',   // Yellow
  Received: 'hsl(var(--chart-4))',   // Orange
  Settled: 'hsl(var(--chart-5))',     // Purple
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 5) return null; // Don't render label if slice is too small

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

export function ClaimStagePieChart({ data }: ClaimStagePieChartProps) {
  const validData = data.filter(item => item.value > 0);

  if (validData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Claim Stage Breakdown</CardTitle>
                <CardDescription>Distribution of claims by current stage.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No data available for chart.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim Stage Breakdown</CardTitle>
        <CardDescription>Distribution of claims by current stage.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as ClaimStageKpi]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} claims`, name]}
              cursor={false} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
