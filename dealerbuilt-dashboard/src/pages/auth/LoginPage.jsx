import React, { useState, useEffect } from 'react';
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
import { Loader2, Building2, User, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage = () => {
  const { isAuthenticated, login, loading } = useAuth();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    organizationId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard/executive';
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(formData);
      
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

  const handleDemoLogin = async (userType) => {
    const demoCredentials = {
      executive: { username: 'executive@dealership.com', password: 'demo123' },
      service_manager: { username: 'service.manager@dealership.com', password: 'demo123' },
      sales_manager: { username: 'sales.manager@dealership.com', password: 'demo123' },
      staff: { username: 'staff@dealership.com', password: 'demo123' },
    };

    const credentials = demoCredentials[userType];
    if (credentials) {
      setFormData({
        ...credentials,
        organizationId: 'org_1',
      });
      
      // Auto-submit after a brief delay
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4"
          >
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            DealerBuilt Dashboard
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your dealership management system
          </p>
        </div>

        {/* Login Form */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Organization Selection */}
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) => handleInputChange('organizationId', value)}
                >
                  <SelectTrigger className={formErrors.organizationId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select your organization" />
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
                  <p className="text-sm text-destructive">{formErrors.organizationId}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`pl-10 ${formErrors.username ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.username && (
                  <p className="text-sm text-destructive">{formErrors.username}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 ${formErrors.password ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                size="lg"
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

            {/* Demo Login Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Demo Login Options
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('executive')}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Executive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('service_manager')}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Service Mgr
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('sales_manager')}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Sales Mgr
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('staff')}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Staff
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                For demo purposes, use any of the demo login buttons above or use credentials:
                <br />
                <strong>Username:</strong> Any demo email
                <br />
                <strong>Password:</strong> demo123
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2025 DealerBuilt Enterprise Dashboard</p>
          <p>Powered by DealerBuilt API Integration</p>
        </div>
      </motion.div>
    </div>
  );
};

