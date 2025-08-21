import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Car, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency, formatNumber, calculatePercentageChange } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

// Type definitions
interface KPIData {
  current: number;
  previous: number;
  target: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  units: number;
  gross: number;
}

interface DepartmentData {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
}

interface LocationData {
  location: string;
  revenue: number;
  units: number;
  efficiency: number;
}

interface Alert {
  id: number;
  type: 'warning' | 'info' | 'error' | 'success';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface KPICardProps {
  title: string;
  value: number;
  previousValue: number;
  target: number;
  format?: 'currency' | 'number' | 'percentage';
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
}

// Mock data for the executive dashboard
const mockKPIData: Record<string, KPIData> = {
  revenue: {
    current: 2847500,
    previous: 2654000,
    target: 3000000,
  },
  units: {
    current: 156,
    previous: 142,
    target: 180,
  },
  grossProfit: {
    current: 487200,
    previous: 445800,
    target: 520000,
  },
  csi: {
    current: 4.7,
    previous: 4.5,
    target: 4.8,
  },
};

const mockRevenueData: RevenueData[] = [
  { month: 'Jan', revenue: 2200000, units: 120, gross: 380000 },
  { month: 'Feb', revenue: 2350000, units: 128, gross: 410000 },
  { month: 'Mar', revenue: 2654000, units: 142, gross: 445800 },
  { month: 'Apr', revenue: 2847500, units: 156, gross: 487200 },
];

const mockDepartmentData: DepartmentData[] = [
  { name: 'Sales', revenue: 1847500, percentage: 65, color: '#3b82f6' },
  { name: 'Service', revenue: 687200, percentage: 24, color: '#10b981' },
  { name: 'Parts', revenue: 312800, percentage: 11, color: '#f59e0b' },
];

const mockLocationData: LocationData[] = [
  { location: 'Premier Ford Lincoln', revenue: 847500, units: 45, efficiency: 92 },
  { location: 'Premier Honda', revenue: 654200, units: 38, efficiency: 88 },
  { location: 'Premier Toyota', revenue: 587300, units: 34, efficiency: 85 },
  { location: 'Premier Chevrolet', revenue: 758500, units: 39, efficiency: 90 },
];

const mockAlerts: Alert[] = [
  { id: 1, type: 'warning', message: 'Service capacity at 95% for next week', priority: 'high' },
  { id: 2, type: 'info', message: 'Q1 sales target achieved', priority: 'medium' },
  { id: 3, type: 'error', message: 'Parts inventory low for brake pads', priority: 'high' },
  { id: 4, type: 'success', message: 'Customer satisfaction improved by 4%', priority: 'low' },
];

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  previousValue, 
  target, 
  format = 'currency', 
  icon: Icon, 
  trend 
}) => {
  const percentageChange = calculatePercentageChange(value, previousValue);
  const targetProgress = (value / target) * 100;

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return formatNumber(val);
    }
  };

  const getTrendColor = (): string => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (): LucideIcon => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Target;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          <div className="flex items-center space-x-2">
            <TrendIcon className={`h-4 w-4 ${getTrendColor()}`} />
            <span className={`text-sm ${getTrendColor()}`}>
              {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">vs last month</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Target: {formatValue(target)}</span>
              <span>{targetProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ExecutiveDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRefresh = async (): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getPriorityColor = (priority: Alert['priority']): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: Alert['type']): LucideIcon => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}. Here's your business overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="ford">Premier Ford Lincoln</SelectItem>
              <SelectItem value="honda">Premier Honda</SelectItem>
              <SelectItem value="toyota">Premier Toyota</SelectItem>
              <SelectItem value="chevrolet">Premier Chevrolet</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={mockKPIData.revenue.current}
          previousValue={mockKPIData.revenue.previous}
          target={mockKPIData.revenue.target}
          format="currency"
          icon={DollarSign}
          trend="up"
        />
        <KPICard
          title="Units Sold"
          value={mockKPIData.units.current}
          previousValue={mockKPIData.units.previous}
          target={mockKPIData.units.target}
          format="number"
          icon={Car}
          trend="up"
        />
        <KPICard
          title="Gross Profit"
          value={mockKPIData.grossProfit.current}
          previousValue={mockKPIData.grossProfit.previous}
          target={mockKPIData.grossProfit.target}
          format="currency"
          icon={TrendingUp}
          trend="up"
        />
        <KPICard
          title="CSI Score"
          value={mockKPIData.csi.current}
          previousValue={mockKPIData.csi.previous}
          target={mockKPIData.csi.target}
          format="percentage"
          icon={Users}
          trend="up"
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="locations">Location Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Department</CardTitle>
                <CardDescription>Revenue distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockDepartmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {mockDepartmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Units Sold</CardTitle>
              <CardDescription>Correlation between revenue and units sold</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                      name === 'revenue' ? 'Revenue' : 'Units'
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="units"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Performance</CardTitle>
              <CardDescription>Revenue and efficiency by location</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockLocationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Important notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${getPriorityColor(alert.priority)}`}
                >
                  <AlertIcon className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.priority}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
