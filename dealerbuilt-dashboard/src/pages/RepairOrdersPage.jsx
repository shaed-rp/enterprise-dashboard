import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ClipboardList } from 'lucide-react';

export const RepairOrdersPage = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Repair Orders</h2>
        <p className="text-muted-foreground">Manage service repair orders</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5" />
            <span>Repair Order Management</span>
          </CardTitle>
          <CardDescription>RO management tools coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Repair order tracking, technician assignment, and progress monitoring.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
