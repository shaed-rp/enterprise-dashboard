import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Package } from 'lucide-react';

export const PartsDashboard: React.FC = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Parts Management</h2>
        <p className="text-muted-foreground">Inventory tracking and parts operations</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Parts Dashboard</span>
          </CardTitle>
          <CardDescription>Parts inventory and management tools coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Inventory levels, ordering, pricing, and parts analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
