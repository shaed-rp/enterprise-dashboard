import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Custom matchers for testing
expect.extend({
  toHaveBeenCalledWithMatch(received, ...expected) {
    const pass = vi.mocked(received).mock.calls.some(call =>
      expected.every((arg, index) => {
        if (typeof arg === 'object' && arg !== null) {
          return expect(call[index]).toMatchObject(arg);
        }
        return call[index] === arg;
      })
    );

    return {
      pass,
      message: () =>
        `expected ${received.getMockName()} to have been called with arguments matching ${JSON.stringify(expected)}`,
    };
  },
});

// Test utilities
export const mockApiResponse = <T>(data: T, success: boolean = true) => ({
  success,
  data,
  error: success ? undefined : 'Test error',
  timestamp: new Date().toISOString(),
});

export const mockApiError = (message: string = 'Test error', status: number = 500) => ({
  message,
  status,
  code: 'TEST_ERROR',
});

// Mock data factories
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: 'https://example.com/avatar.jpg',
  allowedLocations: ['location-1'],
  role: 'executive' as const,
  ...overrides,
});

export const createMockOrganization = (overrides: Partial<any> = {}) => ({
  id: 'org-1',
  name: 'Test Organization',
  logo: 'https://example.com/logo.png',
  type: 'dealership_group' as const,
  settings: {
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'system' as const,
    language: 'en',
  },
  locations: [],
  ...overrides,
});

// Test environment configuration
export const testConfig = {
  apiBaseUrl: 'http://localhost:5000/api',
  mockDelay: 100,
  testTimeout: 10000,
};
