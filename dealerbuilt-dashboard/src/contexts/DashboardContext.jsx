import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DashboardContext = createContext();

// Dashboard state reducer
const dashboardReducer = (state, action) => {
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

const initialState = {
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

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { user, location, hasPermission } = useAuth();

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
          console.error('Failed to load dashboard preferences:', error);
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

  const setSidebarCollapsed = (collapsed) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  };

  const setActiveDashboard = (dashboard) => {
    dispatch({ type: 'SET_ACTIVE_DASHBOARD', payload: dashboard });
  };

  const updateWidget = (widgetId, updates) => {
    dispatch({ type: 'UPDATE_WIDGET', payload: { id: widgetId, updates } });
  };

  const addWidget = (widget) => {
    const newWidget = {
      ...widget,
      id: widget.id || `widget_${Date.now()}`,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_WIDGET', payload: newWidget });
  };

  const removeWidget = (widgetId) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: widgetId });
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setDateRange = (range) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: range });
  };

  const setRefreshInterval = (interval) => {
    dispatch({ type: 'SET_REFRESH_INTERVAL', payload: interval });
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || `notification_${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const markNotificationRead = (notificationId) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const setSearchResults = (results) => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
  };

  const addRecentItem = (item) => {
    const recentItem = {
      ...item,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_RECENT_ITEM', payload: recentItem });
  };

  // Get available dashboards based on user permissions
  const getAvailableDashboards = () => {
    const dashboards = [];

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

    if (hasPermission('Parts Module Access') || hasPermission('Parts Managers')) {
      dashboards.push({
        id: 'parts',
        name: 'Parts',
        icon: 'Package',
        path: '/dashboard/parts',
      });
    }

    if (hasPermission('Finance Managers') || hasPermission('F&I Reports')) {
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

  const value = {
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

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

