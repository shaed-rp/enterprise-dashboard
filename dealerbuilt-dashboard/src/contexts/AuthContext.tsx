import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { mockAuthService } from '../services/mockAuthService';
import { AuthData, LoginCredentials, User, Organization, Location, UserPermissions } from '../types';
import { SecureTokenManager, SessionManager, AuditLogger, SecureLogger } from '../lib/security';

// Auth state interface
interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  organization: Organization | null;
  location: Location | null;
  permissions: UserPermissions;
  error: string | null;
}

// Auth action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthData }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SWITCH_CONTEXT'; payload: Partial<AuthData> }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchContext: (contextData: Partial<AuthData>) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  hasAnyPermission: (permissions: (keyof UserPermissions)[]) => boolean;
  hasAllPermissions: (permissions: (keyof UserPermissions)[]) => boolean;
  canAccessLocation: (locationId: string) => boolean;
  canAccessDepartment: (department: string) => boolean;
  getUserRole: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth state reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
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
        permissions: {} as UserPermissions,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        organization: null,
        location: null,
        permissions: {} as UserPermissions,
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
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  user: null,
  organization: null,
  location: null,
  permissions: {} as UserPermissions,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from secure storage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = SecureTokenManager.getToken();
      const userData = sessionStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData) as User;
          const isValid = await mockAuthService.validateToken(token);
          
          if (isValid) {
            // Reconstruct auth data from stored user
            const authData: AuthData = {
              token,
              user,
              organization: state.organization!,
              location: state.location!,
              permissions: state.permissions,
            };
            
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: authData,
            });
            
            // Start secure session management
            SessionManager.startSession();
            
            AuditLogger.logAuthEvent('LOGIN', true, { method: 'token_restore' });
          }
        } catch (error) {
          SecureTokenManager.clearToken();
          sessionStorage.removeItem('user_data');
          SecureLogger.error('Failed to restore authentication from token', error);
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const authData = await mockAuthService.login(credentials);
      
      // Store auth data securely
      SecureTokenManager.setToken(authData.token);
      sessionStorage.setItem('user_data', JSON.stringify(authData.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: authData,
      });
      
      // Start secure session management
      SessionManager.startSession();
      
      // Log successful authentication
      AuditLogger.logAuthEvent('LOGIN', true, { 
        method: 'credentials',
        username: credentials.username 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Log failed authentication
      AuditLogger.logAuthEvent('LOGIN_FAILED', false, { 
        method: 'credentials',
        username: credentials.username,
        error: errorMessage 
      });
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = (): void => {
    // Log logout event
    AuditLogger.logAuthEvent('LOGOUT', true);
    
    // Clear secure storage
    SecureTokenManager.clearToken();
    sessionStorage.removeItem('user_data');
    
    // End secure session
    SessionManager.endSession();
    
    dispatch({ type: 'LOGOUT' });
  };

  const switchContext = async (contextData: Partial<AuthData>): Promise<{ success: boolean; error?: string }> => {
    try {
      // In a real app, this would call the API
      dispatch({
        type: 'SWITCH_CONTEXT',
        payload: contextData,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Context switch failed';
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      // In a real app, this would call the API
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: profileData,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Permission checking utilities
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!state.permissions) return false;
    return Boolean(state.permissions[permission]) || Boolean(state.permissions['DMS_User']);
  };

  const hasAnyPermission = (permissions: (keyof UserPermissions)[]): boolean => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: (keyof UserPermissions)[]): boolean => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessLocation = (locationId: string): boolean => {
    if (!state.user || !state.user.allowedLocations) return false;
    return state.user.allowedLocations.includes(locationId) || 
           state.user.allowedLocations.includes('*');
  };

  const canAccessDepartment = (department: string): boolean => {
    const departmentPermissions: Record<string, (keyof UserPermissions)[]> = {
      'service': ['Service Module Access', 'Service Managers', 'Service Writers'],
      'sales': ['Sales/F&I Module Access', 'Sales Managers'],
      'parts': ['Parts Module Access', 'Parts Counter'],
      'finance': ['Finance Managers'],
      'accounting': ['Accounting Access'],
    };

    const requiredPermissions = departmentPermissions[department.toLowerCase()] || [];
    return hasAnyPermission(requiredPermissions);
  };

  const getUserRole = (): string => {
    if (!state.user) return 'guest';
    
    // Determine primary role based on permissions
    if (hasPermission('Dealer Principal')) return 'dealer_principal';
    if (hasPermission('Executive')) return 'executive';
    if (hasAnyPermission(['Service Managers', 'Sales Managers'])) return 'department_manager';
    if (hasAnyPermission(['Service Writers', 'Parts Counter'])) return 'staff';
    
    return 'user';
  };

  const value: AuthContextType = {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
