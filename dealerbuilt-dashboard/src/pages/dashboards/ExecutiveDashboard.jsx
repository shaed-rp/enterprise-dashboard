import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Car, 
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  MapPin,
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

// Mock data for the executive dashboard
const mockKPIData = {
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

const mockRevenueData = [
  { month: 'Jan', revenue: 2200000, units: 120, gross: 380000 },
  { month: 'Feb', revenue: 2350000, units: 128, gross: 410000 },
  { month: 'Mar', revenue: 2654000, units: 142, gross: 445800 },
  { month: 'Apr', revenue: 2847500, units: 156, gross: 487200 },
];

const mockDepartmentData = [
  { name: 'Sales', revenue: 1847500, percentage: 65, color: '#3b82f6' },
  { name: 'Service', revenue: 687200, percentage: 24, color: '#10b981' },
  { name: 'Parts', revenue: 312800, percentage: 11, color: '#f59e0b' },
];

const mockLocationData = [
  { location: 'Premier Ford Lincoln', revenue: 847500, units: 45, efficiency: 92 },
  { location: 'Premier Honda', revenue: 654200, units: 38, efficiency: 88 },
  { location: 'Premier Toyota', revenue: 587300, units: 34, efficiency: 85 },
  { location: 'Premier Chevrolet', revenue: 758500, units: 39, efficiency: 90 },
];

const mockAlerts = [
  { id: 1, type: 'warning', message: 'Service capacity at 95% for next week', priority: 'high' },
  { id: 2, type: 'info', message: 'Q1 sales target achieved', priority: 'medium' },
  { id: 3, type: 'error', message: 'Parts inventory low for brake pads', priority: 'high' },
  { id: 4, type: 'success', message: 'Customer satisfaction improved by 4%', priority: 'low' },
];

const KPICard = ({ title, value, previousValue, target, format = 'currency', icon: Icon, trend }) => {
  const change = calculatePercentageChange(value, previousValue);
  const targetProgress = target ? (value / target) * 100 : 0;
  
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'number':
        return formatNumber(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'rating':
        return `${val.toFixed(1)}/5.0`;
      default:
        return val;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            {change > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
          <span>from last period</span>
        </div>
        {target && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Target Progress</span>
              <span>{targetProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ExecutiveDashboard = () => {
  const { user, organization, location } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics and insights across all operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {organization?.locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <KPICard
            title="Total Revenue"
            value={mockKPIData.revenue.current}
            previousValue={mockKPIData.revenue.previous}
            target={mockKPIData.revenue.target}
            format="currency"
            icon={DollarSign}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <KPICard
            title="Units Sold"
            value={mockKPIData.units.current}
            previousValue={mockKPIData.units.previous}
            target={mockKPIData.units.target}
            format="number"
            icon={Car}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <KPICard
            title="Gross Profit"
            value={mockKPIData.grossProfit.current}
            previousValue={mockKPIData.grossProfit.previous}
            target={mockKPIData.grossProfit.target}
            format="currency"
            icon={TrendingUp}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <KPICard
            title="Customer Satisfaction"
            value={mockKPIData.csi.current}
            previousValue={mockKPIData.csi.previous}
            target={mockKPIData.csi.target}
            format="rating"
            icon={Users}
          />
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, 'USD').replace('.00', '')} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Revenue distribution by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockDepartmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {mockDepartmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {mockDepartmentData.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="text-sm">{dept.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(dept.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Location Performance & Alerts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Location Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Location Performance</CardTitle>
              <CardDescription>Performance metrics by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLocationData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{location.location}</p>
                        <p className="text-sm text-muted-foreground">
                          {location.units} units • {location.efficiency}% efficiency
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(location.revenue)}</p>
                      <Badge variant={location.efficiency > 90 ? 'default' : 'secondary'}>
                        {location.efficiency}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts & Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Important updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    {alert.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                    {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                    {alert.type === 'info' && <Clock className="h-4 w-4 text-blue-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <Badge 
                        variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                        className="mt-1 text-xs"
                      >
                        {alert.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

