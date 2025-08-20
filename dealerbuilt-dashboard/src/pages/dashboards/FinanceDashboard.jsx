import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { DollarSign } from 'lucide-react';

export const FinanceDashboard = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Finance & Insurance</h2>
        <p className="text-muted-foreground">Financial metrics and F&I performance</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Finance Dashboard</span>
          </CardTitle>
          <CardDescription>Financial analytics and F&I metrics coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Deal profitability, F&I penetration, and financial performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
