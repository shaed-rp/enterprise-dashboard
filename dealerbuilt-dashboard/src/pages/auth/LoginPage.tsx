import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { mockOrganizationData } from '../../data/mockOrganizationData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Building2, User, Lock, AlertCircle, Play, Crown, Wrench, Car, Users } from 'lucide-react';
import { toast } from 'sonner';
import { LoginCredentials } from '../../types';

// Form data interface
interface LoginFormData {
  username: string;
  password: string;
  organizationId: string;
}

// Form errors interface
interface FormErrors {
  username?: string;
  password?: string;
  organizationId?: string;
}

// Demo user types
type DemoUserType = 'executive' | 'service_manager' | 'sales_manager' | 'staff';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, login, quickDemoMode } = useAuth();
  const location = useLocation();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    organizationId: 'org_1', // Auto-select first organization
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showManualForm, setShowManualForm] = useState<boolean>(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard/executive';
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (field: keyof LoginFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }
    
    if (!formData.organizationId) {
      errors.organizationId = 'Please select an organization';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | { preventDefault: () => void }): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const credentials: LoginCredentials = {
        username: formData.username,
        password: formData.password,
        organizationId: formData.organizationId,
      };
      
      const result = await login(credentials);
      
      if (result.success) {
        toast.success('Login successful!');
        // Navigation will be handled by the redirect above
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (userType: DemoUserType): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Use quick demo mode for instant access (SOC2 VIOLATION - FOR DEMO ONLY)
      const result = await quickDemoMode(userType);
      
      if (result.success) {
        toast.success(`Welcome! Logged in as ${userType.replace('_', ' ')}`);
      } else {
        toast.error(result.error || 'Demo login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-3"
          >
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            DealerX Enterprise Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Demo Environment - Click any role to start
          </p>
        </div>

        {/* Demo Login Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/20"
              onClick={() => handleDemoLogin('executive')}
            >
              <CardContent className="p-4 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm">Executive</h3>
                <p className="text-xs text-muted-foreground">Full Access</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/20"
              onClick={() => handleDemoLogin('service_manager')}
            >
              <CardContent className="p-4 text-center">
                <Wrench className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm">Service Manager</h3>
                <p className="text-xs text-muted-foreground">Service Operations</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/20"
              onClick={() => handleDemoLogin('sales_manager')}
            >
              <CardContent className="p-4 text-center">
                <Car className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm">Sales Manager</h3>
                <p className="text-xs text-muted-foreground">Sales & Deals</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/20"
              onClick={() => handleDemoLogin('staff')}
            >
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm">Staff</h3>
                <p className="text-xs text-muted-foreground">Basic Access</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Manual Login Toggle */}
        <div className="text-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManualForm(!showManualForm)}
            className="text-xs"
          >
            {showManualForm ? 'Hide' : 'Show'} Manual Login
          </Button>
        </div>

        {/* Manual Login Form */}
        {showManualForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Manual Login</CardTitle>
                <CardDescription>
                  Enter credentials manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Organization Selection */}
                  <div className="space-y-1">
                    <Label htmlFor="organization" className="text-sm">Organization</Label>
                    <Select
                      value={formData.organizationId}
                      onValueChange={(value: string) => handleInputChange('organizationId', value)}
                    >
                      <SelectTrigger className={formErrors.organizationId ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockOrganizationData.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4" />
                              <span>{org.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.organizationId && (
                      <p className="text-xs text-destructive">{formErrors.organizationId}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <Label htmlFor="username" className="text-sm">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username or email"
                        value={formData.username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('username', e.target.value)}
                        className={`pl-10 h-9 ${formErrors.username ? 'border-destructive' : ''}`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.username && (
                      <p className="text-xs text-destructive">{formErrors.username}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                        className={`pl-10 h-9 ${formErrors.password ? 'border-destructive' : ''}`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.password && (
                      <p className="text-xs text-destructive">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-9"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Quick Demo Buttons */}
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-2">Quick Demo:</p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('executive')}
                      disabled={isSubmitting}
                      className="text-xs flex-1 h-7"
                    >
                      Executive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('service_manager')}
                      disabled={isSubmitting}
                      className="text-xs flex-1 h-7"
                    >
                      Service
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('sales_manager')}
                      disabled={isSubmitting}
                      className="text-xs flex-1 h-7"
                    >
                      Sales
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('staff')}
                      disabled={isSubmitting}
                      className="text-xs flex-1 h-7"
                    >
                      Staff
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Demo Info */}
        <Alert className="mt-4">
          <Play className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Demo Mode:</strong> Click any role card above for instant access. 
            All demo data is simulated for demonstration purposes.
          </AlertDescription>
        </Alert>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2025 DealerX Enterprise Dashboard</p>
          <p>Demo Environment - Powered by DMS Integration</p>
        </div>
      </motion.div>
    </div>
  );
};
