import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Generate reports and analyze data</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Reporting Suite</span>
          </CardTitle>
          <CardDescription>Advanced reporting tools coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Custom reports, analytics, and business intelligence.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
