import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { CommandPalette } from '../components/dashboard/CommandPalette';
import { NotificationCenter } from '../components/dashboard/NotificationCenter';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Menu, Search, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export const DashboardLayout = () => {
  const { user, organization, location: currentLocation } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setNotificationCenterOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <DashboardSidebar 
            collapsed={false}
            mobile={true}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out",
          "lg:ml-0", // Remove default margin
          !sidebarCollapsed && "lg:ml-64", // Add margin when sidebar is expanded
          sidebarCollapsed && "lg:ml-16" // Add smaller margin when collapsed
        )}
      >
        {/* Header */}
        <DashboardHeader 
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationCenterOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette 
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
      
      <NotificationCenter 
        open={notificationCenterOpen}
        onOpenChange={setNotificationCenterOpen}
      />

      {/* Mobile Bottom Navigation (Optional) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center space-y-1"
          >
            <Menu className="h-4 w-4" />
            <span className="text-xs">Menu</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex flex-col items-center space-y-1"
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Search</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationCenterOpen(true)}
            className="flex flex-col items-center space-y-1"
          >
            <Bell className="h-4 w-4" />
            <span className="text-xs">Alerts</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

