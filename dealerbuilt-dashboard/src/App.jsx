import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ExecutiveDashboard } from './pages/dashboards/ExecutiveDashboard';
import { ServiceDashboard } from './pages/dashboards/ServiceDashboard';
import { SalesDashboard } from './pages/dashboards/SalesDashboard';
import { PartsDashboard } from './pages/dashboards/PartsDashboard';
import { FinanceDashboard } from './pages/dashboards/FinanceDashboard';
import { CustomerPortal } from './pages/dashboards/CustomerPortal';
import { VendorPortal } from './pages/dashboards/VendorPortal';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { CustomersPage } from './pages/CustomersPage';
import { InventoryPage } from './pages/InventoryPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { RepairOrdersPage } from './pages/RepairOrdersPage';
import { DealsPage } from './pages/DealsPage';
import './App.css';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <DashboardProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  {/* Dashboard Routes */}
                  <Route index element={<Navigate to="/dashboard/executive" replace />} />
                  <Route path="dashboard/executive" element={<ExecutiveDashboard />} />
                  <Route path="dashboard/service" element={<ServiceDashboard />} />
                  <Route path="dashboard/sales" element={<SalesDashboard />} />
                  <Route path="dashboard/parts" element={<PartsDashboard />} />
                  <Route path="dashboard/finance" element={<FinanceDashboard />} />
                  <Route path="dashboard/customer" element={<CustomerPortal />} />
                  <Route path="dashboard/vendor" element={<VendorPortal />} />
                  
                  {/* Operational Routes */}
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="repair-orders" element={<RepairOrdersPage />} />
                  <Route path="deals" element={<DealsPage />} />
                  
                  {/* System Routes */}
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard/executive" replace />} />
              </Routes>
              
              {/* Global Components */}
              <Toaster 
                position="top-right" 
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
            </div>
          </Router>
        </DashboardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

