import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Users } from 'lucide-react';

export const CustomerPortal = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customer Portal</h2>
        <p className="text-muted-foreground">Customer-facing dashboard and services</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Customer Portal</span>
          </CardTitle>
          <CardDescription>Customer self-service portal coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Appointment scheduling, service history, and customer communications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
