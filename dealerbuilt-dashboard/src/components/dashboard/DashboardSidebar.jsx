import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  BarChart3, 
  Wrench, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  Building2,
  Search,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  FileText,
  Car,
  ClipboardList,
  Handshake,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';

const navigationItems = [
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: BarChart3,
    children: [
      { id: 'executive', label: 'Executive Overview', icon: BarChart3, path: '/dashboard/executive', permissions: ['Executive', 'Dealer Principal'] },
      { id: 'service', label: 'Service Operations', icon: Wrench, path: '/dashboard/service', permissions: ['Service Module Access', 'Service Managers'] },
      { id: 'sales', label: 'Sales Performance', icon: TrendingUp, path: '/dashboard/sales', permissions: ['Sales/F&I Module Access', 'Sales Managers'] },
      { id: 'parts', label: 'Parts Management', icon: Package, path: '/dashboard/parts', permissions: ['Parts Module Access', 'Parts Managers'] },
      { id: 'finance', label: 'Finance & Insurance', icon: DollarSign, path: '/dashboard/finance', permissions: ['Finance Managers', 'F&I Reports'] },
      { id: 'customer', label: 'Customer Portal', icon: Users, path: '/dashboard/customer', permissions: [] },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Building2,
    children: [
      { id: 'customers', label: 'Customer Management', icon: Users, path: '/customers', permissions: ['Customer Master Access'] },
      { id: 'inventory', label: 'Vehicle Inventory', icon: Car, path: '/inventory', permissions: ['Inventory Control', 'View Inventory'] },
      { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments', permissions: ['Access Scheduler'] },
      { id: 'repair-orders', label: 'Repair Orders', icon: ClipboardList, path: '/repair-orders', permissions: ['Service Module Access'] },
      { id: 'deals', label: 'Sales Deals', icon: Handshake, path: '/deals', permissions: ['Deal Access'] },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: FileText,
    children: [
      { id: 'reports', label: 'All Reports', icon: FileText, path: '/reports', permissions: ['Management Reports'] },
    ],
  },
];

const secondaryNavItems = [
  { id: 'search', label: 'Search', icon: Search, shortcut: '⌘K' },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: true },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

export const DashboardSidebar = ({ collapsed, onToggleCollapse, mobile = false, onNavigate }) => {
  const { user, logout, hasAnyPermission } = useAuth();
  const { notifications } = useDashboard();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['dashboards']);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const filterItemsByPermissions = (items) => {
    return items.filter(item => {
      if (!item.permissions || item.permissions.length === 0) return true;
      return hasAnyPermission(item.permissions);
    });
  };

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: mobile ? 320 : (collapsed ? 64 : 256),
        transition: { duration: 0.3, ease: 'easeInOut' }
      }}
      className={cn(
        "fixed left-0 top-0 z-50 h-full bg-sidebar border-r border-sidebar-border",
        "flex flex-col",
        mobile && "relative w-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">DealerBuilt</h2>
                <p className="text-xs text-sidebar-foreground/60">Enterprise Dashboard</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!mobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* New Dashboard Button */}
      {!collapsed && (
        <div className="p-4">
          <Button className="w-full justify-start" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Dashboard View
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-2">
          {navigationItems.map((section) => {
            const filteredChildren = filterItemsByPermissions(section.children);
            if (filteredChildren.length === 0) return null;

            const isExpanded = expandedSections.includes(section.id);

            return (
              <div key={section.id} className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-9 px-3",
                    collapsed && "justify-center px-0"
                  )}
                  onClick={() => !collapsed && toggleSection(section.id)}
                >
                  <section.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{section.label}</span>
                      <ChevronRight 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-90"
                        )} 
                      />
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {!collapsed && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 space-y-1">
                        {filteredChildren.map((item) => (
                          <Button
                            key={item.id}
                            variant={isActiveRoute(item.path) ? "secondary" : "ghost"}
                            className="w-full justify-start h-8 px-3 text-sm"
                            onClick={() => handleNavigation(item.path)}
                          >
                            <item.icon className="mr-3 h-3 w-3" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Secondary Navigation */}
      <div className="border-t border-sidebar-border p-2">
        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-9 px-3",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-sidebar-foreground/60">{item.shortcut}</span>
                  )}
                  {item.badge && unreadNotifications > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "space-x-3")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {getInitials(`${user?.firstName} ${user?.lastName}`)}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-3 flex space-x-1">
            <Button variant="ghost" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

