import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Car } from 'lucide-react';

export const InventoryPage = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vehicle Inventory</h2>
        <p className="text-muted-foreground">Manage vehicle inventory and pricing</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5" />
            <span>Vehicle Inventory</span>
          </CardTitle>
          <CardDescription>Inventory management tools coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vehicle listings, pricing, and inventory tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
