import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Lock,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SecurityMonitor } from '../components/security/SecurityMonitor';
import { SecurityConfigManager, AuditLogger } from '../lib/security';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { user, permissions } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log settings change for audit trail
      AuditLogger.logUserAction({
        timestamp: new Date().toISOString(),
        userId: user?.id || 'unknown',
        action: 'SETTINGS_UPDATED',
        resource: section,
        success: true,
        details: { section }
      });
      
      toast.success(`${section} settings updated successfully`);
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityStatus = () => {
    const config = SecurityConfigManager.getConfig();
    return {
      sessionTimeout: Math.floor(config.sessionTimeout / (1000 * 60)), // Convert to minutes
      maxLoginAttempts: config.maxLoginAttempts,
      rateLimitEnabled: true,
      auditLoggingEnabled: true,
      secureLoggingEnabled: true,
    };
  };

  const securityStatus = getSecurityStatus();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Security Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user?.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user?.lastName} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={user?.role} disabled />
              </div>
              <Button 
                onClick={() => handleSaveSettings('profile')}
                disabled={isLoading}
              >
                {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
              <CardDescription>
                Current security status and compliance information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Session Timeout</p>
                    <p className="text-2xl font-bold">{securityStatus.sessionTimeout}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Max Login Attempts</p>
                    <p className="text-2xl font-bold">{securityStatus.maxLoginAttempts}</p>
                  </div>
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Rate Limiting</p>
                    <Badge variant="default" className="mt-1">
                      {securityStatus.rateLimitEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Audit Logging</p>
                    <Badge variant="default" className="mt-1">
                      {securityStatus.auditLoggingEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Configure security settings and compliance controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after inactivity
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      defaultValue={securityStatus.sessionTimeout}
                      className="w-20"
                      min="5"
                      max="480"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maximum Login Attempts</Label>
                    <p className="text-sm text-muted-foreground">
                      Lock account after failed attempts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      defaultValue={securityStatus.maxLoginAttempts}
                      className="w-20"
                      min="3"
                      max="10"
                    />
                    <span className="text-sm text-muted-foreground">attempts</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require additional verification for login
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Secure Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent sensitive data in console logs
                    </p>
                  </div>
                  <Switch defaultChecked={securityStatus.secureLoggingEnabled} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Certificate Pinning</Label>
                    <p className="text-sm text-muted-foreground">
                      Validate SSL certificates to prevent MITM attacks
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSaveSettings('security')}
                  disabled={isLoading}
                >
                  {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Save Security Settings
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                SOC2 Compliance Status
              </CardTitle>
              <CardDescription>
                Current compliance status for SOC2 requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Authentication Security</p>
                      <p className="text-sm text-muted-foreground">Secure token storage and session management</p>
                    </div>
                  </div>
                  <Badge variant="default">Compliant</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Data Protection</p>
                      <p className="text-sm text-muted-foreground">Client-side encryption and secure logging</p>
                    </div>
                  </div>
                  <Badge variant="default">Compliant</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Audit Trail</p>
                      <p className="text-sm text-muted-foreground">Comprehensive logging of all user actions</p>
                    </div>
                  </div>
                  <Badge variant="default">Compliant</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Input Validation</p>
                      <p className="text-sm text-muted-foreground">XSS and injection attack prevention</p>
                    </div>
                  </div>
                  <Badge variant="default">Compliant</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">API abuse prevention and monitoring</p>
                    </div>
                  </div>
                  <Badge variant="default">Compliant</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about security events
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about system maintenance
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Performance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerts about system performance issues
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('notifications')}
                disabled={isLoading}
              >
                {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <select className="border rounded-md px-3 py-2">
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for more content
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('appearance')}
                disabled={isLoading}
              >
                {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <SecurityMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
