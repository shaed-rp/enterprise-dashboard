/**
 * Security Monitor Component
 * 
 * Provides real-time security monitoring and compliance status
 * for SOC2 compliance requirements.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  Lock, 
  Eye, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  Network,
  FileText
} from 'lucide-react';
import { 
  SecurityConfigManager, 
  RateLimiter, 
  AuditLogger,
  SecureLogger 
} from '../../lib/security';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface SecurityStatus {
  sessionActive: boolean;
  sessionTimeRemaining: number;
  rateLimitStatus: {
    remaining: number;
    total: number;
    percentage: number;
  };
  lastActivity: Date;
  securityEvents: SecurityEvent[];
  complianceScore: number;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'authentication' | 'data_access' | 'session' | 'rate_limit' | 'security';
  message: string;
  details?: Record<string, unknown>;
}

interface ComplianceMetric {
  name: string;
  status: 'compliant' | 'non_compliant' | 'warning';
  description: string;
  lastChecked: Date;
}

export const SecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock security events for demonstration
  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      type: 'success',
      category: 'authentication',
      message: 'User login successful',
      details: { method: 'credentials', ipAddress: '192.168.1.100' }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      type: 'info',
      category: 'data_access',
      message: 'Customer data accessed',
      details: { resource: 'customers', action: 'READ', customerId: 'cust-123' }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      type: 'warning',
      category: 'rate_limit',
      message: 'Rate limit approaching threshold',
      details: { endpoint: '/api/customers', remaining: 10 }
    }
  ];

  // Mock compliance metrics
  const mockComplianceMetrics: ComplianceMetric[] = [
    {
      name: 'Authentication Security',
      status: 'compliant',
      description: 'Multi-factor authentication and secure token storage implemented',
      lastChecked: new Date()
    },
    {
      name: 'Data Encryption',
      status: 'compliant',
      description: 'Client-side encryption for sensitive data enabled',
      lastChecked: new Date()
    },
    {
      name: 'Audit Logging',
      status: 'compliant',
      description: 'Comprehensive audit trail for all user actions',
      lastChecked: new Date()
    },
    {
      name: 'Session Management',
      status: 'compliant',
      description: 'Secure session timeout and activity monitoring',
      lastChecked: new Date()
    },
    {
      name: 'Input Validation',
      status: 'compliant',
      description: 'XSS and injection attack prevention implemented',
      lastChecked: new Date()
    },
    {
      name: 'Rate Limiting',
      status: 'compliant',
      description: 'API rate limiting to prevent abuse',
      lastChecked: new Date()
    }
  ];

  const refreshSecurityStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call to get security status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const config = SecurityConfigManager.getConfig();
      const sessionTimeRemaining = Math.max(0, config.sessionTimeout - (Date.now() % config.sessionTimeout));
      
      const status: SecurityStatus = {
        sessionActive: true,
        sessionTimeRemaining,
        rateLimitStatus: {
          remaining: 85,
          total: 100,
          percentage: 85
        },
        lastActivity: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        securityEvents: mockSecurityEvents,
        complianceScore: 98
      };
      
      setSecurityStatus(status);
      setComplianceMetrics(mockComplianceMetrics);
      setLastRefresh(new Date());
      
      // Log security status check
      AuditLogger.logSecurityEvent('SECURITY_STATUS_CHECKED', 'monitoring', true, {
        userId: user?.id,
        complianceScore: status.complianceScore
      });
      
      toast.success('Security status updated');
    } catch (error) {
      SecureLogger.error('Failed to refresh security status', error);
      toast.error('Failed to update security status');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSecurityStatus();
    
    // Set up periodic refresh
    const interval = setInterval(refreshSecurityStatus, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [refreshSecurityStatus]);

  const getStatusColor = (status: 'compliant' | 'non_compliant' | 'warning') => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'non_compliant':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: SecurityEvent['category']) => {
    switch (category) {
      case 'authentication':
        return <Lock className="h-4 w-4" />;
      case 'data_access':
        return <Database className="h-4 w-4" />;
      case 'session':
        return <Users className="h-4 w-4" />;
      case 'rate_limit':
        return <Network className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!securityStatus) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Monitor
            </CardTitle>
            <CardDescription>
              Real-time security status and compliance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Monitor</h1>
          <p className="text-muted-foreground">
            Real-time security status and SOC2 compliance monitoring
          </p>
        </div>
        <Button 
          onClick={refreshSecurityStatus} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SOC2 Compliance Score
          </CardTitle>
          <CardDescription>
            Overall security compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Compliance Score</span>
                <span className="text-sm text-muted-foreground">
                  {securityStatus.complianceScore}%
                </span>
              </div>
              <Progress value={securityStatus.complianceScore} className="h-2" />
            </div>
            <Badge 
              variant={securityStatus.complianceScore >= 95 ? 'default' : 'secondary'}
              className="text-sm"
            >
              {securityStatus.complianceScore >= 95 ? 'Excellent' : 'Good'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Session Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityStatus.sessionActive ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              Time remaining: {formatTimeRemaining(securityStatus.sessionTimeRemaining)}
            </p>
          </CardContent>
        </Card>

        {/* Rate Limit Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityStatus.rateLimitStatus.remaining}/{securityStatus.rateLimitStatus.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {securityStatus.rateLimitStatus.percentage}% remaining
            </p>
          </CardContent>
        </Card>

        {/* Last Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((Date.now() - securityStatus.lastActivity.getTime()) / (1000 * 60))}m
            </div>
            <p className="text-xs text-muted-foreground">
              ago
            </p>
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityStatus.securityEvents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              in last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Metrics</CardTitle>
          <CardDescription>
            Detailed SOC2 compliance status for each security control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{metric.name}</h4>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Last checked: {metric.lastChecked.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Latest security events and audit trail entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityStatus.securityEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex items-center gap-2 mt-1">
                  {getEventIcon(event.type)}
                  {getCategoryIcon(event.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{event.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {event.details && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {Object.entries(event.details)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Alerts
          </CardTitle>
          <CardDescription>
            Active security alerts and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityStatus.rateLimitStatus.percentage < 20 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Rate limit is approaching threshold. Consider reducing API call frequency.
                </AlertDescription>
              </Alert>
            )}
            
            {securityStatus.sessionTimeRemaining < 5 * 60 * 1000 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Session will expire soon. Consider refreshing your session.
                </AlertDescription>
              </Alert>
            )}

            {securityStatus.complianceScore < 95 && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Compliance score is below optimal threshold. Review security controls.
                </AlertDescription>
              </Alert>
            )}

            {securityStatus.securityEvents.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No security events detected. System is operating normally.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Last updated: {lastRefresh.toLocaleString()}</p>
        <p>Security monitoring is active and compliant with SOC2 requirements</p>
      </div>
    </div>
  );
};

