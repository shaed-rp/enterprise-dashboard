import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExecutiveDashboard } from '../ExecutiveDashboard';
import { createMockUser, createMockExecutiveSummary } from '../../../test/utils';

// Mock the useAuth hook
const mockUseAuth = {
  user: createMockUser(),
  isAuthenticated: true,
  loading: false,
};

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock the utils functions
vi.mock('../../../lib/utils', () => ({
  formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
  formatNumber: (num: number) => num.toLocaleString(),
  calculatePercentageChange: (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },
}));

describe('ExecutiveDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with correct title and welcome message', () => {
    render(<ExecutiveDashboard />);
    
    expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, John/)).toBeInTheDocument();
  });

  it('displays all KPI cards with correct data', () => {
    render(<ExecutiveDashboard />);
    
    // Check KPI cards are rendered
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Units Sold')).toBeInTheDocument();
    expect(screen.getByText('Gross Profit')).toBeInTheDocument();
    expect(screen.getByText('CSI Score')).toBeInTheDocument();
    
    // Check values are displayed
    expect(screen.getByText('$2,847,500')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText('$487,200')).toBeInTheDocument();
    expect(screen.getByText('4.7%')).toBeInTheDocument();
  });

  it('displays location and period selectors', () => {
    render(<ExecutiveDashboard />);
    
    expect(screen.getByText('All Locations')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('displays refresh button', () => {
    render(<ExecutiveDashboard />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    render(<ExecutiveDashboard />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    
    fireEvent.click(refreshButton);
    
    // Button should be disabled during refresh
    expect(refreshButton).toBeDisabled();
    
    // Wait for refresh to complete
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });
  });

  it('displays tabs for different views', () => {
    render(<ExecutiveDashboard />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Revenue Analysis')).toBeInTheDocument();
    expect(screen.getByText('Location Performance')).toBeInTheDocument();
  });

  it('shows overview tab content by default', () => {
    render(<ExecutiveDashboard />);
    
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Revenue by Department')).toBeInTheDocument();
  });

  it('switches to revenue analysis tab when clicked', () => {
    render(<ExecutiveDashboard />);
    
    const revenueTab = screen.getByText('Revenue Analysis');
    fireEvent.click(revenueTab);
    
    expect(screen.getByText('Revenue vs Units Sold')).toBeInTheDocument();
  });

  it('switches to location performance tab when clicked', () => {
    render(<ExecutiveDashboard />);
    
    const locationTab = screen.getByText('Location Performance');
    fireEvent.click(locationTab);
    
    expect(screen.getByText('Location Performance')).toBeInTheDocument();
  });

  it('displays alerts section', () => {
    render(<ExecutiveDashboard />);
    
    expect(screen.getByText('Recent Alerts')).toBeInTheDocument();
    expect(screen.getByText(/Service capacity at 95%/)).toBeInTheDocument();
    expect(screen.getByText(/Q1 sales target achieved/)).toBeInTheDocument();
  });

  it('displays alert priorities correctly', () => {
    render(<ExecutiveDashboard />);
    
    const highPriorityAlerts = screen.getAllByText('high');
    const mediumPriorityAlerts = screen.getAllByText('medium');
    const lowPriorityAlerts = screen.getAllByText('low');
    
    expect(highPriorityAlerts.length).toBeGreaterThan(0);
    expect(mediumPriorityAlerts.length).toBeGreaterThan(0);
    expect(lowPriorityAlerts.length).toBeGreaterThan(0);
  });

  it('handles location selection', () => {
    render(<ExecutiveDashboard />);
    
    const locationSelect = screen.getByText('All Locations');
    fireEvent.click(locationSelect);
    
    // Should show location options
    expect(screen.getByText('Premier Ford Lincoln')).toBeInTheDocument();
    expect(screen.getByText('Premier Honda')).toBeInTheDocument();
    expect(screen.getByText('Premier Toyota')).toBeInTheDocument();
    expect(screen.getByText('Premier Chevrolet')).toBeInTheDocument();
  });

  it('handles period selection', () => {
    render(<ExecutiveDashboard />);
    
    const periodSelect = screen.getByText('Month');
    fireEvent.click(periodSelect);
    
    // Should show period options
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Quarter')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
  });

  it('displays percentage changes in KPI cards', () => {
    render(<ExecutiveDashboard />);
    
    // Check that percentage changes are displayed
    const percentageChanges = screen.getAllByText(/vs last month/);
    expect(percentageChanges.length).toBeGreaterThan(0);
  });

  it('displays target progress bars', () => {
    render(<ExecutiveDashboard />);
    
    // Check that target progress is displayed
    const targetTexts = screen.getAllByText(/Target:/);
    expect(targetTexts.length).toBeGreaterThan(0);
  });

  it('displays trend icons correctly', () => {
    render(<ExecutiveDashboard />);
    
    // Check that trend icons are present (they should be rendered as SVGs)
    const trendIcons = document.querySelectorAll('[data-testid="trend-icon"]');
    expect(trendIcons.length).toBeGreaterThan(0);
  });

  it('handles loading state during refresh', async () => {
    render(<ExecutiveDashboard />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    
    fireEvent.click(refreshButton);
    
    // Check for loading spinner
    const loadingSpinner = refreshButton.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
    
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });
  });

  it('displays correct chart titles and descriptions', () => {
    render(<ExecutiveDashboard />);
    
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Monthly revenue performance')).toBeInTheDocument();
    
    expect(screen.getByText('Revenue by Department')).toBeInTheDocument();
    expect(screen.getByText('Revenue distribution across departments')).toBeInTheDocument();
  });

  it('displays department breakdown data', () => {
    render(<ExecutiveDashboard />);
    
    // Check that department names are displayed
    expect(screen.getByText('Sales 65%')).toBeInTheDocument();
    expect(screen.getByText('Service 24%')).toBeInTheDocument();
    expect(screen.getByText('Parts 11%')).toBeInTheDocument();
  });

  it('displays location performance data', () => {
    render(<ExecutiveDashboard />);
    
    // Switch to location performance tab
    const locationTab = screen.getByText('Location Performance');
    fireEvent.click(locationTab);
    
    // Check that location names are displayed
    expect(screen.getByText('Premier Ford Lincoln')).toBeInTheDocument();
    expect(screen.getByText('Premier Honda')).toBeInTheDocument();
    expect(screen.getByText('Premier Toyota')).toBeInTheDocument();
    expect(screen.getByText('Premier Chevrolet')).toBeInTheDocument();
  });

  it('handles empty user data gracefully', () => {
    mockUseAuth.user = null;
    
    render(<ExecutiveDashboard />);
    
    // Should still render the dashboard
    expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
  });

  it('displays alert types with correct styling', () => {
    render(<ExecutiveDashboard />);
    
    // Check that different alert types are displayed
    const warningAlerts = screen.getAllByText(/warning/i);
    const successAlerts = screen.getAllByText(/success/i);
    const errorAlerts = screen.getAllByText(/error/i);
    const infoAlerts = screen.getAllByText(/info/i);
    
    expect(warningAlerts.length).toBeGreaterThan(0);
    expect(successAlerts.length).toBeGreaterThan(0);
    expect(errorAlerts.length).toBeGreaterThan(0);
    expect(infoAlerts.length).toBeGreaterThan(0);
  });

  it('maintains responsive design', () => {
    render(<ExecutiveDashboard />);
    
    // Check that the main container has responsive classes
    const mainContainer = screen.getByText('Executive Dashboard').closest('div');
    expect(mainContainer).toHaveClass('space-y-6');
  });

  it('displays correct number formatting', () => {
    render(<ExecutiveDashboard />);
    
    // Check that large numbers are properly formatted
    expect(screen.getByText('$2,847,500')).toBeInTheDocument();
    expect(screen.getByText('$487,200')).toBeInTheDocument();
  });

  it('shows correct trend directions', () => {
    render(<ExecutiveDashboard />);
    
    // All trends should be positive in the mock data
    const trendTexts = screen.getAllByText(/\+/);
    expect(trendTexts.length).toBeGreaterThan(0);
  });
});
