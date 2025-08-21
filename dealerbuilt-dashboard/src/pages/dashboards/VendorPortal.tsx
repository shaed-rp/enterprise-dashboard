import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Building2 } from 'lucide-react';

export const VendorPortal: React.FC = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vendor Portal</h2>
        <p className="text-muted-foreground">Vendor management and communications</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Vendor Portal</span>
          </CardTitle>
          <CardDescription>Vendor collaboration tools coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vendor communications, ordering, and performance tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
