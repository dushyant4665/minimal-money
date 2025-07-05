'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface BudgetVsActualChartProps {
  data: { category: string; budget: number; actual: number }[];
  isLoading?: boolean;
}

export function BudgetVsActualChart({ data, isLoading }: BudgetVsActualChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No budget data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
            <Bar dataKey="actual" fill="#ef4444" name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 