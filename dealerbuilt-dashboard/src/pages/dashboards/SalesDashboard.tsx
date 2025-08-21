import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp } from 'lucide-react';

export const SalesDashboard: React.FC = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sales Performance</h2>
        <p className="text-muted-foreground">Track sales metrics, inventory, and team performance</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Sales Dashboard</span>
          </CardTitle>
          <CardDescription>Comprehensive sales analytics coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sales funnel, inventory management, lead tracking, and performance metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
