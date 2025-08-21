import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { mockAuthService } from '../services/mockAuthService';
import { AuthData, LoginCredentials, User, Organization, Location, UserPermissions } from '../types';
import { SecureTokenManager, SessionManager, AuditLogger, SecureLogger } from '../lib/security';

// Demo user types
type DemoUserType = 'executive' | 'service_manager' | 'sales_manager' | 'staff';

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
  quickDemoMode: (userType: DemoUserType) => Promise<{ success: boolean; error?: string }>;
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

  /**
   * Quick demo mode bypass (SOC2 VIOLATION - FOR DEMO ONLY)
   * This bypasses all authentication for instant demo access
   * REMOVE THIS IN PRODUCTION
   */
  const quickDemoMode = async (userType: DemoUserType): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create mock user data based on type
      const mockUsers: Record<DemoUserType, User> = {
        executive: {
          id: 'exec_1',
          firstName: 'John',
          lastName: 'Executive',
          email: 'executive@dealership.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive',
          allowedLocations: ['*'],
          role: 'executive',
        },
        service_manager: {
          id: 'service_1',
          firstName: 'Sarah',
          lastName: 'Service',
          email: 'service.manager@dealership.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Service',
          allowedLocations: ['loc_1', 'loc_2'],
          role: 'service_manager',
        },
        sales_manager: {
          id: 'sales_1',
          firstName: 'Mike',
          lastName: 'Sales',
          email: 'sales.manager@dealership.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sales',
          allowedLocations: ['loc_1', 'loc_2'],
          role: 'sales_manager',
        },
        staff: {
          id: 'staff_1',
          firstName: 'Lisa',
          lastName: 'Staff',
          email: 'staff@dealership.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Staff',
          allowedLocations: ['loc_1'],
          role: 'staff',
        },
      };

      const mockPermissions: Record<DemoUserType, UserPermissions> = {
        executive: {
          Executive: true,
          'Dealer Principal': true,
          'Accounting Access': true,
          'Service Module Access': true,
          'Sales/F&I Module Access': true,
          'Parts Module Access': true,
          'Management Reports': true,
        },
        service_manager: {
          'Service Module Access': true,
          'Service Managers': true,
          'Service Reports': true,
          'Can Enter Jobs': true,
          'Can Enter Parts': true,
          'Can Enter Tech Time': true,
          'Can Mark RO Completed': true,
          'Can Open ROs': true,
        },
        sales_manager: {
          'Sales/F&I Module Access': true,
          'Sales Managers': true,
          'Sales Reports': true,
          'Deal Access': true,
          'Inventory Control': true,
        },
        staff: {
          'Service Module Access': true,
          'Service Writers': true,
          'Can Enter Jobs': true,
        },
      };

      const user = mockUsers[userType];
      const permissions = mockPermissions[userType];

      // Create mock auth data
      const authData: AuthData = {
        token: `demo_token_${userType}_${Date.now()}`,
        user,
        organization: {
          id: 'org_1',
          name: 'Demo Dealership Group',
          logo: 'https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=Demo',
          type: 'dealership_group',
          settings: {
            timezone: 'America/New_York',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            theme: 'system',
            language: 'en',
          },
          locations: [
            {
              id: 'loc_1',
              name: 'Main Dealership',
              address: '123 Auto Drive, City, State 12345',
              phone: '(555) 123-4567',
              timezone: 'America/New_York',
              type: 'ford_lincoln',
              departments: ['sales', 'service', 'parts', 'finance'],
              manager: 'John Manager',
              coordinates: { lat: 40.7128, lng: -74.0060 },
            },
          ],
        },
        location: {
          id: 'loc_1',
          name: 'Main Dealership',
          address: '123 Auto Drive, City, State 12345',
          phone: '(555) 123-4567',
          timezone: 'America/New_York',
          type: 'ford_lincoln',
          departments: ['sales', 'service', 'parts', 'finance'],
          manager: 'John Manager',
          coordinates: { lat: 40.7128, lng: -74.0060 },
        },
        permissions,
      };

      dispatch({ type: 'LOGIN_SUCCESS', payload: authData });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Demo mode failed' };
    }
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
    quickDemoMode, // Add the new function
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
