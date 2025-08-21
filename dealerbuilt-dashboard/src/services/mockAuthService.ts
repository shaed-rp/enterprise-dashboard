import { AuthData, LoginCredentials, User, UserPermissions } from '../types';
import { mockEmployeeData } from '../data/mockEmployeeData';
import { mockOrganizationData } from '../data/mockOrganizationData';

class MockAuthService {
  private delay: (ms: number) => Promise<void>;

  constructor() {
    this.delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials: LoginCredentials): Promise<AuthData> {
    await this.delay(800); // Simulate network delay

    const { username, password, organizationId } = credentials;

    // Find user in mock employee data
    const employee = mockEmployeeData.find(emp => 
      emp.email.toLowerCase() === username.toLowerCase() ||
      `${emp.firstName}.${emp.lastName}`.toLowerCase() === username.toLowerCase()
    );

    if (!employee) {
      throw new Error('Invalid username or password');
    }

    // Simple password validation (in real app, this would be properly hashed)
    if (password !== 'demo123' && password !== 'password') {
      throw new Error('Invalid username or password');
    }

    // Get organization data
    const organization = mockOrganizationData.find(org => org.id === organizationId) || mockOrganizationData[0];

    // Get user's allowed locations
    const allowedLocations = employee.allowedLocations || [];
    const defaultLocation = organization.locations.find(loc => 
      allowedLocations.includes(loc.id.toString())
    ) || organization.locations[0];

    // Generate permissions based on employee data
    const permissions = this.generatePermissions(employee);

    const authData: AuthData = {
      token: this.generateToken(),
      user: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}${employee.lastName}`,
        allowedLocations: allowedLocations,
        role: this.determineRole(permissions),
      },
      organization: {
        id: organization.id,
        name: organization.name,
        logo: organization.logo,
        type: organization.type,
        locations: organization.locations.filter(loc => 
          allowedLocations.includes(loc.id.toString()) || allowedLocations.includes('*')
        ),
        settings: organization.settings,
      },
      location: defaultLocation,
      permissions: permissions,
    };

    return authData;
  }

  async logout(): Promise<void> {
    await this.delay(300);
    // In a real app, this would invalidate the token on the server
  }

  async refreshToken(_token: string): Promise<{ token: string }> {
    await this.delay(500);
    return { token: this.generateToken() };
  }

  async validateToken(token: string): Promise<boolean> {
    await this.delay(200);
    // Simple token validation (in real app, this would verify with the server)
    return token.length > 10;
  }

  private generateToken(): string {
    return 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9);
  }

  private generatePermissions(employee: User & UserPermissions): UserPermissions {
    return {
      Executive: employee.Executive,
      'Dealer Principal': employee['Dealer Principal'],
      'Accounting Access': employee['Accounting Access'],
      'Service Module Access': employee['Service Module Access'],
      'Sales/F&I Module Access': employee['Sales/F&I Module Access'],
      'Parts Module Access': employee['Parts Module Access'],
      'Management Reports': employee['Management Reports'],
      'Service Managers': employee['Service Managers'],
      'Service Reports': employee['Service Reports'],
      'Can Enter Jobs': employee['Can Enter Jobs'],
      'Can Enter Parts': employee['Can Enter Parts'],
      'Can Enter Tech Time': employee['Can Enter Tech Time'],
      'Can Mark RO Completed': employee['Can Mark RO Completed'],
      'Can Open ROs': employee['Can Open ROs'],
      'Sales Managers': employee['Sales Managers'],
      'Sales Reports': employee['Sales Reports'],
      'Deal Access': employee['Deal Access'],
      'Inventory Control': employee['Inventory Control'],
      'Finance Managers': employee['Finance Managers'],
      'Service Writers': employee['Service Writers'],
      'Parts Counter': employee['Parts Counter'],
      'Office': employee['Office'],
      'DMS_User': employee['DMS_User'],
    };
  }

  private determineRole(permissions: UserPermissions): User['role'] {
    if (permissions.Executive) return 'executive';
    if (permissions['Service Managers']) return 'service_manager';
    if (permissions['Sales Managers']) return 'sales_manager';
    if (permissions['Service Writers'] || permissions['Parts Counter']) return 'staff';
    return 'staff';
  }
}

// Export singleton instance
export const mockAuthService = new MockAuthService();
