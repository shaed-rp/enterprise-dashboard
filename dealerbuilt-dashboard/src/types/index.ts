// Core Type Definitions for DealerX Enterprise Dashboard

// User and Authentication Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  allowedLocations: string[];
  role: UserRole;
}

export type UserRole = 'executive' | 'service_manager' | 'sales_manager' | 'staff' | 'customer' | 'vendor';

export interface UserPermissions {
  Executive?: boolean;
  'Dealer Principal'?: boolean;
  'Accounting Access'?: boolean;
  'Service Module Access'?: boolean;
  'Sales/F&I Module Access'?: boolean;
  'Parts Module Access'?: boolean;
  'Management Reports'?: boolean;
  'Service Managers'?: boolean;
  'Service Reports'?: boolean;
  'Can Enter Jobs'?: boolean;
  'Can Enter Parts'?: boolean;
  'Can Enter Tech Time'?: boolean;
  'Can Mark RO Completed'?: boolean;
  'Can Open ROs'?: boolean;
  'Sales Managers'?: boolean;
  'Sales Reports'?: boolean;
  'Deal Access'?: boolean;
  'Inventory Control'?: boolean;
  'Finance Managers'?: boolean;
  'Service Writers'?: boolean;
  'Parts Counter'?: boolean;
  'Office'?: boolean;
  'DMS_User'?: boolean;
}

// Organization and Location Types
export interface Organization {
  id: string;
  name: string;
  logo: string;
  type: 'dealership_group';
  settings: OrganizationSettings;
  locations: Location[];
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  timezone: string;
  type: LocationType;
  departments: Department[];
  manager: string;
  coordinates: Coordinates;
}

export type LocationType = 'ford_lincoln' | 'chevrolet_buick' | 'honda' | 'toyota' | 'nissan' | 'hyundai' | 'kia' | 'mazda' | 'subaru' | 'volkswagen' | 'audi' | 'bmw' | 'mercedes' | 'lexus' | 'acura' | 'infiniti' | 'cadillac' | 'buick' | 'gmc' | 'dodge' | 'chrysler' | 'jeep' | 'ram' | 'fiat' | 'alfa_romeo' | 'maserati' | 'ferrari' | 'lamborghini' | 'porsche' | 'bentley' | 'rolls_royce' | 'aston_martin' | 'mclaren' | 'lotus' | 'jaguar' | 'land_rover' | 'mini' | 'smart' | 'fisker' | 'rivian' | 'lucid' | 'tesla' | 'polestar' | 'volvo' | 'genesis' | 'other';

export type Department = 'sales' | 'service' | 'parts' | 'finance' | 'administration' | 'marketing' | 'hr' | 'it';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Authentication Types
export interface AuthData {
  token: string;
  user: User;
  organization: Organization;
  location: Location;
  permissions: UserPermissions;
}

export interface LoginCredentials {
  username: string;
  password: string;
  organizationId: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export interface DealerBuiltApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  cache_hit?: boolean;
  response_time?: number;
}

// Dashboard Data Types
export interface ExecutiveSummary {
  revenue: number;
  unitsSold: number;
  grossProfit: number;
  customerSatisfaction: number;
  activeDeals: number;
  pendingAppointments: number;
  inventoryValue: number;
  monthlyTrend: TrendData[];
}

export interface ServiceSummary {
  activeROs: number;
  completedROs: number;
  pendingAppointments: number;
  technicianUtilization: number;
  averageROValue: number;
  customerWaitTime: number;
  partsOnOrder: number;
  monthlyTrend: TrendData[];
}

export interface SalesSummary {
  dealsInProgress: number;
  dealsClosed: number;
  conversionRate: number;
  averageDealValue: number;
  inventoryTurnover: number;
  customerLeads: number;
  monthlyTrend: TrendData[];
}

export interface PartsSummary {
  totalInventory: number;
  lowStockItems: number;
  outOfStockItems: number;
  inventoryValue: number;
  ordersPending: number;
  supplierPerformance: number;
  monthlyTrend: TrendData[];
}

export interface TrendData {
  date: string;
  value: number;
  label: string;
}

// Chart and UI Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'number';
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  children?: NavigationItem[];
  permissions?: (keyof UserPermissions)[];
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & { [P in K]-?: T[P] };
