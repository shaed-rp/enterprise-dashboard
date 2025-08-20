// Mock authentication service simulating DealerBuilt API
import { mockEmployeeData } from '../data/mockEmployeeData';
import { mockOrganizationData } from '../data/mockOrganizationData';

class MockAuthService {
  constructor() {
    this.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials) {
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

    const authData = {
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

  async validateToken(token) {
    await this.delay(300);

    // In a real app, this would validate the JWT token
    if (!token || token === 'invalid') {
      throw new Error('Invalid token');
    }

    // Return mock user data for valid tokens
    return this.getMockUserData();
  }

  async switchContext({ organizationId, locationId }) {
    await this.delay(400);

    const organization = mockOrganizationData.find(org => org.id === organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const location = organization.locations.find(loc => loc.id === locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    return {
      organization,
      location,
      permissions: this.generatePermissions(), // Regenerate based on new context
    };
  }

  async updateProfile(profileData) {
    await this.delay(500);

    // Simulate profile update
    return {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
  }

  generateToken() {
    // Generate a mock JWT-like token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: 'user123', 
      iat: Date.now() / 1000,
      exp: (Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock_signature');
    
    return `${header}.${payload}.${signature}`;
  }

  generatePermissions(employee) {
    if (!employee) {
      return ['DMS_User']; // Basic permissions
    }

    const permissions = [];

    // Add permissions based on employee data columns
    Object.keys(employee).forEach(key => {
      if (employee[key] === 'X' || employee[key] === true) {
        permissions.push(key);
      }
    });

    // Always include basic user permission
    if (!permissions.includes('DMS_User')) {
      permissions.push('DMS_User');
    }

    return permissions;
  }

  determineRole(permissions) {
    if (permissions.includes('Dealer Principal')) return 'dealer_principal';
    if (permissions.includes('General Manager Loc 21') || permissions.includes('General Manager Loc 24')) return 'general_manager';
    if (permissions.some(p => p.includes('Managers'))) return 'department_manager';
    if (permissions.includes('Executive')) return 'executive';
    if (permissions.some(p => p.includes('Service Writers') || p.includes('Salepersons') || p.includes('Parts Counter'))) return 'staff';
    return 'user';
  }

  getMockUserData() {
    // Return default mock user for token validation
    return {
      user: {
        id: 'user_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dealership.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
        allowedLocations: ['1', '2', '8', '13'],
        role: 'general_manager',
      },
      organization: mockOrganizationData[0],
      location: mockOrganizationData[0].locations[0],
      permissions: ['DMS_User', 'General Manager Loc 21', 'Executive', 'Service Module Access'],
    };
  }

  // Utility methods for testing different user types
  async loginAsExecutive() {
    return this.login({
      username: 'executive@dealership.com',
      password: 'demo123',
      organizationId: 'org_1'
    });
  }

  async loginAsServiceManager() {
    return this.login({
      username: 'service.manager@dealership.com',
      password: 'demo123',
      organizationId: 'org_1'
    });
  }

  async loginAsSalesManager() {
    return this.login({
      username: 'sales.manager@dealership.com',
      password: 'demo123',
      organizationId: 'org_1'
    });
  }

  async loginAsStaff() {
    return this.login({
      username: 'staff@dealership.com',
      password: 'demo123',
      organizationId: 'org_1'
    });
  }
}

export const mockAuthService = new MockAuthService();

