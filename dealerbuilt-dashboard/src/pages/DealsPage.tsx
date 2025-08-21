import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Handshake } from 'lucide-react';

export const DealsPage: React.FC = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sales Deals</h2>
        <p className="text-muted-foreground">Manage sales transactions and deals</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Handshake className="h-5 w-5" />
            <span>Deal Management</span>
          </CardTitle>
          <CardDescription>Sales deal tracking coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Deal pipeline, contract management, and sales tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
