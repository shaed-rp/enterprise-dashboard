import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Notification } from '../types';
import { SecureLogger, AuditLogger } from '../lib/security';

// Widget interface
interface Widget {
  id: string;
  type: string;
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
  createdAt: Date;
}

// Dashboard filters interface
interface DashboardFilters {
  location: string | null;
  department: string | null;
  dateRange: string;
  status: string;
}

// Date range interface
interface DateRange {
  start: Date;
  end: Date;
}

// Recent item interface
interface RecentItem {
  id: string;
  type: string;
  title: string;
  url: string;
  timestamp: Date;
}

// Dashboard state interface
interface DashboardState {
  loading: boolean;
  sidebarCollapsed: boolean;
  activeDashboard: string;
  widgets: Widget[];
  filters: DashboardFilters;
  dateRange: DateRange;
  refreshInterval: number;
  notifications: Notification[];
  searchResults: any[];
  recentItems: RecentItem[];
}

// Dashboard action types
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_ACTIVE_DASHBOARD'; payload: string }
  | { type: 'SET_WIDGETS'; payload: Widget[] }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: Partial<Widget> } }
  | { type: 'ADD_WIDGET'; payload: Widget }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: any[] }
  | { type: 'SET_RECENT_ITEMS'; payload: RecentItem[] }
  | { type: 'ADD_RECENT_ITEM'; payload: RecentItem };

// Dashboard context interface
interface DashboardContextType extends DashboardState {
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveDashboard: (dashboard: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  addWidget: (widget: Partial<Widget>) => void;
  removeWidget: (widgetId: string) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setDateRange: (range: DateRange) => void;
  setRefreshInterval: (interval: number) => void;
  addNotification: (notification: Partial<Notification>) => void;
  markNotificationRead: (notificationId: string) => void;
  setSearchResults: (results: any[]) => void;
  addRecentItem: (item: Partial<RecentItem>) => void;
  getAvailableDashboards: () => Array<{
    id: string;
    name: string;
    icon: string;
    path: string;
  }>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Dashboard state reducer
const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SET_ACTIVE_DASHBOARD':
      return { ...state, activeDashboard: action.payload };
    case 'SET_WIDGETS':
      return { ...state, widgets: action.payload };
    case 'UPDATE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === action.payload.id ? { ...widget, ...action.payload.updates } : widget
        ),
      };
    case 'ADD_WIDGET':
      return { ...state, widgets: [...state.widgets, action.payload] };
    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter(widget => widget.id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50), // Keep last 50
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        ),
      };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_RECENT_ITEMS':
      return { ...state, recentItems: action.payload };
    case 'ADD_RECENT_ITEM':
      return {
        ...state,
        recentItems: [
          action.payload,
          ...state.recentItems.filter(item => item.id !== action.payload.id)
        ].slice(0, 10), // Keep last 10
      };
    default:
      return state;
  }
};

const initialState: DashboardState = {
  loading: false,
  sidebarCollapsed: false,
  activeDashboard: 'executive',
  widgets: [],
  filters: {
    location: null,
    department: null,
    dateRange: 'last_30_days',
    status: 'all',
  },
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  },
  refreshInterval: 60000, // 1 minute
  notifications: [],
  searchResults: [],
  recentItems: [],
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { user, hasPermission } = useAuth();

  // Load user preferences on mount
  useEffect(() => {
    if (user) {
      const savedPreferences = localStorage.getItem(`dashboard_prefs_${user.id}`);
      if (savedPreferences) {
        try {
          const prefs = JSON.parse(savedPreferences);
          dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: prefs.sidebarCollapsed || false });
          dispatch({ type: 'SET_REFRESH_INTERVAL', payload: prefs.refreshInterval || 60000 });
          dispatch({ type: 'SET_FILTERS', payload: prefs.filters || {} });
            } catch (error) {
      SecureLogger.error('Failed to load dashboard preferences', error);
    }
      }
    }
  }, [user]);

  // Save preferences when they change
  useEffect(() => {
    if (user) {
      const preferences = {
        sidebarCollapsed: state.sidebarCollapsed,
        refreshInterval: state.refreshInterval,
        filters: state.filters,
      };
      localStorage.setItem(`dashboard_prefs_${user.id}`, JSON.stringify(preferences));
    }
  }, [user, state.sidebarCollapsed, state.refreshInterval, state.filters]);

  const setSidebarCollapsed = (collapsed: boolean): void => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  };

  const setActiveDashboard = (dashboard: string): void => {
    dispatch({ type: 'SET_ACTIVE_DASHBOARD', payload: dashboard });
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>): void => {
    dispatch({ type: 'UPDATE_WIDGET', payload: { id: widgetId, updates } });
  };

  const addWidget = (widget: Partial<Widget>): void => {
    const newWidget: Widget = {
      id: widget.id || `widget_${Date.now()}`,
      type: widget.type || 'default',
      title: widget.title || 'New Widget',
      config: widget.config || {},
      position: widget.position || { x: 0, y: 0, w: 6, h: 4 },
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_WIDGET', payload: newWidget });
  };

  const removeWidget = (widgetId: string): void => {
    dispatch({ type: 'REMOVE_WIDGET', payload: widgetId });
  };

  const setFilters = (filters: Partial<DashboardFilters>): void => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setDateRange = (range: DateRange): void => {
    dispatch({ type: 'SET_DATE_RANGE', payload: range });
  };

  const setRefreshInterval = (interval: number): void => {
    dispatch({ type: 'SET_REFRESH_INTERVAL', payload: interval });
  };

  const addNotification = (notification: Partial<Notification>): void => {
    const newNotification: Notification = {
      id: notification.id || `notification_${Date.now()}`,
      type: notification.type || 'info',
      title: notification.title || 'Notification',
      message: notification.message || '',
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const markNotificationRead = (notificationId: string): void => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const setSearchResults = (results: any[]): void => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
  };

  const addRecentItem = (item: Partial<RecentItem>): void => {
    const recentItem: RecentItem = {
      id: item.id || `item_${Date.now()}`,
      type: item.type || 'default',
      title: item.title || 'Recent Item',
      url: item.url || '#',
      timestamp: new Date(),
      ...item,
    };
    dispatch({ type: 'ADD_RECENT_ITEM', payload: recentItem });
  };

  // Get available dashboards based on user permissions
  const getAvailableDashboards = (): Array<{
    id: string;
    name: string;
    icon: string;
    path: string;
  }> => {
    const dashboards: Array<{
      id: string;
      name: string;
      icon: string;
      path: string;
    }> = [];

    if (hasPermission('Executive') || hasPermission('Dealer Principal')) {
      dashboards.push({
        id: 'executive',
        name: 'Executive',
        icon: 'BarChart3',
        path: '/dashboard/executive',
      });
    }

    if (hasPermission('Service Module Access') || hasPermission('Service Managers')) {
      dashboards.push({
        id: 'service',
        name: 'Service',
        icon: 'Wrench',
        path: '/dashboard/service',
      });
    }

    if (hasPermission('Sales/F&I Module Access') || hasPermission('Sales Managers')) {
      dashboards.push({
        id: 'sales',
        name: 'Sales',
        icon: 'TrendingUp',
        path: '/dashboard/sales',
      });
    }

    if (hasPermission('Parts Module Access') || hasPermission('Parts Counter')) {
      dashboards.push({
        id: 'parts',
        name: 'Parts',
        icon: 'Package',
        path: '/dashboard/parts',
      });
    }

    if (hasPermission('Finance Managers')) {
      dashboards.push({
        id: 'finance',
        name: 'Finance',
        icon: 'DollarSign',
        path: '/dashboard/finance',
      });
    }

    // Customer portal is always available for customer-facing roles
    dashboards.push({
      id: 'customer',
      name: 'Customer Portal',
      icon: 'Users',
      path: '/dashboard/customer',
    });

    return dashboards;
  };

  const value: DashboardContextType = {
    ...state,
    setSidebarCollapsed,
    setActiveDashboard,
    updateWidget,
    addWidget,
    removeWidget,
    setFilters,
    setDateRange,
    setRefreshInterval,
    addNotification,
    markNotificationRead,
    setSearchResults,
    addRecentItem,
    getAvailableDashboards,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
