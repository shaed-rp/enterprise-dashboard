import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../contexts/AuthContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import { createMockUser, createMockOrganization } from './setup';

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialAuthState?: {
    isAuthenticated?: boolean;
    user?: any;
    organization?: any;
  };
  initialDashboardState?: {
    sidebarCollapsed?: boolean;
    activeDashboard?: string;
  };
}

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  authState?: CustomRenderOptions['initialAuthState'];
  dashboardState?: CustomRenderOptions['initialDashboardState'];
}> = ({ children, authState, dashboardState }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <DashboardProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </DashboardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    initialAuthState = {
      isAuthenticated: true,
      user: createMockUser(),
      organization: createMockOrganization(),
    },
    initialDashboardState = {
      sidebarCollapsed: false,
      activeDashboard: 'executive',
    },
    ...renderOptions
  } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        authState={initialAuthState}
        dashboardState={initialDashboardState}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockExecutiveSummary = (overrides: Partial<any> = {}) => ({
  revenue: 2847500,
  unitsSold: 156,
  grossProfit: 487200,
  customerSatisfaction: 4.7,
  activeDeals: 23,
  pendingAppointments: 45,
  inventoryValue: 1850000,
  totalROs: 156,
  completedROs: 142,
  averageROValue: 1250,
  technicianUtilization: 87.5,
  customerRetention: 92.1,
  ...overrides,
});

export const createMockServiceSummary = (overrides: Partial<any> = {}) => ({
  activeROs: 47,
  completedROs: 142,
  pendingAppointments: 23,
  technicianUtilization: 87.5,
  averageROValue: 1250,
  customerWaitTime: 2.4,
  partsOnOrder: 156,
  monthlyTrend: [
    { date: '2024-01', value: 120, label: 'January' },
    { date: '2024-02', value: 135, label: 'February' },
    { date: '2024-03', value: 142, label: 'March' },
  ],
  ...overrides,
});

export const createMockCustomer = (overrides: Partial<any> = {}) => ({
  id: 'customer-1',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1-555-0123',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
  },
  vehicles: [],
  deals: [],
  repairOrders: [],
  ...overrides,
});

export const createMockVehicle = (overrides: Partial<any> = {}) => ({
  id: 'vehicle-1',
  vin: '1HGBH41JXMN109186',
  make: 'Honda',
  model: 'Civic',
  year: 2023,
  color: 'Blue',
  mileage: 15000,
  licensePlate: 'ABC123',
  customerId: 'customer-1',
  ...overrides,
});

export const createMockRepairOrder = (overrides: Partial<any> = {}) => ({
  id: 'ro-1',
  customerId: 'customer-1',
  vehicleId: 'vehicle-1',
  description: 'Oil change and tire rotation',
  estimatedCost: 150,
  priority: 'medium' as const,
  status: 'in_progress' as const,
  appointmentDate: new Date('2024-01-15'),
  technicianId: 'tech-1',
  notes: 'Customer requested synthetic oil',
  ...overrides,
});

// Mock API responses
export const mockApiResponses = {
  executiveSummary: {
    success: true,
    data: createMockExecutiveSummary(),
    timestamp: new Date().toISOString(),
  },
  serviceSummary: {
    success: true,
    data: createMockServiceSummary(),
    timestamp: new Date().toISOString(),
  },
  customers: {
    success: true,
    data: [createMockCustomer()],
    count: 1,
    timestamp: new Date().toISOString(),
  },
  vehicles: {
    success: true,
    data: [createMockVehicle()],
    count: 1,
    timestamp: new Date().toISOString(),
  },
  repairOrders: {
    success: true,
    data: [createMockRepairOrder()],
    count: 1,
    timestamp: new Date().toISOString(),
  },
};

// Test helpers
export const waitForLoadingToFinish = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

export const mockFetchResponse = (response: any, status: number = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
  });
};

export const mockFetchError = (error: string, status: number = 500) => {
  global.fetch = vi.fn().mockRejectedValue(new Error(error));
};

// Form testing helpers
export const fillFormField = async (
  screen: any,
  label: string,
  value: string
) => {
  const field = screen.getByLabelText(label);
  await userEvent.type(field, value);
};

export const selectOption = async (
  screen: any,
  label: string,
  option: string
) => {
  const select = screen.getByLabelText(label);
  await userEvent.click(select);
  const optionElement = screen.getByText(option);
  await userEvent.click(optionElement);
};

// Assertion helpers
export const expectElementToBeInDocument = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToHaveClass = (element: HTMLElement, className: string) => {
  expect(element).toHaveClass(className);
};

export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeVisible();
};

export const expectElementToBeDisabled = (element: HTMLElement) => {
  expect(element).toBeDisabled();
};

// Async testing helpers
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  await waitFor(() => {
    expect(element).not.toBeInTheDocument();
  });
};

export const waitForElementToHaveText = async (element: HTMLElement, text: string) => {
  await waitFor(() => {
    expect(element).toHaveTextContent(text);
  });
};

// Mock context values
export const mockAuthContextValue = {
  isAuthenticated: true,
  loading: false,
  user: createMockUser(),
  organization: createMockOrganization(),
  location: null,
  permissions: {},
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  switchContext: vi.fn(),
  updateProfile: vi.fn(),
  hasPermission: vi.fn(() => true),
  hasAnyPermission: vi.fn(() => true),
  hasAllPermissions: vi.fn(() => true),
  canAccessLocation: vi.fn(() => true),
  canAccessDepartment: vi.fn(() => true),
  getUserRole: vi.fn(() => 'executive'),
};

export const mockDashboardContextValue = {
  loading: false,
  sidebarCollapsed: false,
  activeDashboard: 'executive',
  widgets: [],
  filters: {},
  dateRange: { startDate: new Date(), endDate: new Date() },
  refreshInterval: 300000,
  notifications: [],
  searchResults: [],
  recentItems: [],
  setSidebarCollapsed: vi.fn(),
  setActiveDashboard: vi.fn(),
  addWidget: vi.fn(),
  removeWidget: vi.fn(),
  updateFilters: vi.fn(),
  setDateRange: vi.fn(),
  setRefreshInterval: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  markNotificationAsRead: vi.fn(),
  setSearchResults: vi.fn(),
  addRecentItem: vi.fn(),
  clearRecentItems: vi.fn(),
};
