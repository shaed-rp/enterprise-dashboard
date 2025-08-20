import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockAuthService } from '../services/mockAuthService';

const AuthContext = createContext();

// Auth state reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        organization: action.payload.organization,
        location: action.payload.location,
        permissions: action.payload.permissions,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        organization: null,
        location: null,
        permissions: [],
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        organization: null,
        location: null,
        permissions: [],
        error: null,
      };
    case 'SWITCH_CONTEXT':
      return {
        ...state,
        organization: action.payload.organization || state.organization,
        location: action.payload.location || state.location,
        permissions: action.payload.permissions || state.permissions,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  loading: false,
  user: null,
  organization: null,
  location: null,
  permissions: [],
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          const authData = await mockAuthService.validateToken(token);
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: authData,
          });
        } catch (error) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const authData = await mockAuthService.login(credentials);
      
      // Store auth data
      localStorage.setItem('auth_token', authData.token);
      localStorage.setItem('user_data', JSON.stringify(authData.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: authData,
      });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    dispatch({ type: 'LOGOUT' });
  };

  const switchContext = async (contextData) => {
    try {
      const updatedContext = await mockAuthService.switchContext(contextData);
      dispatch({
        type: 'SWITCH_CONTEXT',
        payload: updatedContext,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await mockAuthService.updateProfile(profileData);
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: updatedUser,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Permission checking utilities
  const hasPermission = (permission) => {
    if (!state.permissions) return false;
    return state.permissions.includes(permission) || state.permissions.includes('*');
  };

  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessLocation = (locationId) => {
    if (!state.user || !state.user.allowedLocations) return false;
    return state.user.allowedLocations.includes(locationId) || 
           state.user.allowedLocations.includes('*');
  };

  const canAccessDepartment = (department) => {
    const departmentPermissions = {
      'service': ['Service Module Access', 'Service Managers', 'Service Writers'],
      'sales': ['Sales/F&I Module Access', 'Sales Managers', 'Salepersons'],
      'parts': ['Parts Module Access', 'Parts Managers', 'Parts Counter'],
      'finance': ['Finance Managers', 'F&I Reports'],
      'accounting': ['Accounting Access', 'Accounting Executive'],
    };

    const requiredPermissions = departmentPermissions[department.toLowerCase()] || [];
    return hasAnyPermission(requiredPermissions);
  };

  const getUserRole = () => {
    if (!state.user) return 'guest';
    
    // Determine primary role based on permissions
    if (hasPermission('Dealer Principal')) return 'dealer_principal';
    if (hasPermission('General Manager Loc 21') || hasPermission('General Manager Loc 24')) return 'general_manager';
    if (hasAnyPermission(['Service Managers', 'Sales Managers', 'Parts Managers'])) return 'department_manager';
    if (hasAnyPermission(['Service Writers', 'Salepersons', 'Parts Counter'])) return 'staff';
    if (hasPermission('Executive')) return 'executive';
    
    return 'user';
  };

  const value = {
    ...state,
    login,
    logout,
    switchContext,
    updateProfile,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessLocation,
    canAccessDepartment,
    getUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

