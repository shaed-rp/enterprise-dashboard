# Testing Guide

This document provides comprehensive information about the testing infrastructure for the DealerX Enterprise Dashboard.

## 🧪 Testing Infrastructure

The project uses **Vitest** as the testing framework with **React Testing Library** for component testing. The testing setup includes:

- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM environment for testing
- **Coverage reporting**: Built-in coverage with v8 provider
- **Custom test utilities**: Reusable testing helpers

## 🚀 Quick Start

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Open Vitest UI for interactive testing |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ci` | Run tests with coverage for CI |

## 📁 Test Structure

```
src/
├── components/
│   ├── __tests__/
│   │   ├── ErrorBoundary.test.tsx
│   │   └── ...
│   └── ErrorBoundary.tsx
├── services/
│   ├── __tests__/
│   │   ├── apiClient.test.ts
│   │   └── ...
│   └── apiClient.ts
├── lib/
│   ├── __tests__/
│   │   ├── validation.test.ts
│   │   └── ...
│   └── validation.ts
├── pages/
│   └── dashboards/
│       ├── __tests__/
│       │   ├── ExecutiveDashboard.test.tsx
│       │   └── ...
│       └── ExecutiveDashboard.tsx
└── test/
    ├── setup.ts
    └── utils.tsx
```

## 🛠️ Test Utilities

### Custom Render Function

The project includes a custom render function that provides all necessary providers:

```typescript
import { render } from '../test/utils';

// Basic usage
render(<MyComponent />);

// With custom auth state
render(<MyComponent />, {
  initialAuthState: {
    isAuthenticated: true,
    user: createMockUser(),
  },
});

// With custom dashboard state
render(<MyComponent />, {
  initialDashboardState: {
    sidebarCollapsed: true,
    activeDashboard: 'service',
  },
});
```

### Mock Data Factories

```typescript
import { 
  createMockUser, 
  createMockOrganization,
  createMockExecutiveSummary,
  createMockCustomer,
  createMockVehicle,
  createMockRepairOrder,
} from '../test/utils';

// Create mock data with defaults
const user = createMockUser();

// Override specific fields
const customUser = createMockUser({
  firstName: 'Jane',
  role: 'service_manager',
});
```

### API Mocking

```typescript
import { mockFetchResponse, mockFetchError } from '../test/utils';

// Mock successful API response
mockFetchResponse({ success: true, data: mockData });

// Mock API error
mockFetchError('Network error', 500);
```

### Form Testing Helpers

```typescript
import { fillFormField, selectOption } from '../test/utils';

// Fill form fields
await fillFormField(screen, 'Email', 'test@example.com');
await fillFormField(screen, 'Password', 'password123');

// Select dropdown options
await selectOption(screen, 'Department', 'Service');
```

## 📝 Writing Tests

### Component Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    render(<MyComponent isLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../hooks/useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });

  it('updates state when called', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.value).toBe(1);
  });
});
```

### API Testing

```typescript
import { apiClient } from '../services/apiClient';

describe('API Client', () => {
  it('makes successful requests', async () => {
    mockFetchResponse({ success: true, data: { test: 'data' } });
    
    const result = await apiClient.get('/test');
    expect(result.data).toEqual({ test: 'data' });
  });

  it('handles errors gracefully', async () => {
    mockFetchError('Server error', 500);
    
    await expect(apiClient.get('/test')).rejects.toThrow('Server error');
  });
});
```

### Validation Testing

```typescript
import { validateInput, validationSchemas } from '../lib/validation';

describe('Validation', () => {
  it('validates correct data', () => {
    const result = validateInput(validationSchemas.email, 'test@example.com');
    expect(result.success).toBe(true);
  });

  it('rejects invalid data', () => {
    const result = validateInput(validationSchemas.email, 'invalid-email');
    expect(result.success).toBe(false);
    expect(result.errors.errors[0].message).toContain('valid email address');
  });
});
```

## 🎯 Testing Best Practices

### 1. Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  // Happy path tests
  describe('when data is valid', () => {
    it('renders correctly', () => {
      // Test implementation
    });
  });

  // Edge cases
  describe('when data is invalid', () => {
    it('shows error message', () => {
      // Test implementation
    });
  });

  // User interactions
  describe('user interactions', () => {
    it('handles button click', () => {
      // Test implementation
    });
  });
});
```

### 2. Test Naming

Use descriptive test names that explain the behavior:

```typescript
// ✅ Good
it('displays error message when email is invalid', () => {
  // Test implementation
});

it('submits form data when all fields are valid', () => {
  // Test implementation
});

// ❌ Bad
it('works correctly', () => {
  // Test implementation
});

it('test 1', () => {
  // Test implementation
});
```

### 3. Assertions

Use specific assertions and avoid testing implementation details:

```typescript
// ✅ Good - Test behavior
expect(screen.getByText('Success message')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeDisabled();

// ❌ Bad - Test implementation
expect(component.state.isLoading).toBe(true);
expect(component.props.onClick).toHaveBeenCalled();
```

### 4. Async Testing

Always use `waitFor` for async operations:

```typescript
// ✅ Good
await waitFor(() => {
  expect(screen.getByText('Updated content')).toBeInTheDocument();
});

// ❌ Bad
setTimeout(() => {
  expect(screen.getByText('Updated content')).toBeInTheDocument();
}, 100);
```

### 5. Mocking

Mock external dependencies and focus on testing your code:

```typescript
// Mock hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: createMockUser(),
    isAuthenticated: true,
  }),
}));

// Mock API calls
vi.mock('../services/apiClient', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));
```

## 📊 Coverage

The project aims for 80% code coverage across all metrics:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports

After running `npm run test:coverage`, you'll find:

- **Console output**: Summary in terminal
- **HTML report**: `coverage/index.html` - Interactive coverage report
- **JSON report**: `coverage/coverage-summary.json` - Machine-readable format

### Coverage Exclusions

The following are excluded from coverage:

- Test files (`**/__tests__/**`)
- Configuration files (`*.config.*`)
- Type definitions (`*.d.ts`)
- Build artifacts (`dist/`, `coverage/`)

## 🔧 Configuration

### Vitest Configuration

The testing configuration is in `vitest.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Test Setup

The test setup file (`src/test/setup.ts`) includes:

- Jest DOM matchers
- Global mocks (fetch, localStorage, etc.)
- Custom matchers
- Test utilities

## 🚨 Common Issues

### 1. Async Testing

If tests are failing due to async operations, ensure you're using `waitFor`:

```typescript
// ✅ Correct
await waitFor(() => {
  expect(screen.getByText('Async content')).toBeInTheDocument();
});

// ❌ Incorrect
expect(screen.getByText('Async content')).toBeInTheDocument();
```

### 2. Mock Cleanup

Always clean up mocks between tests:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### 3. Provider Wrapping

Use the custom render function to ensure components have access to all providers:

```typescript
// ✅ Correct
import { render } from '../test/utils';
render(<MyComponent />);

// ❌ Incorrect
import { render } from '@testing-library/react';
render(<MyComponent />); // Missing providers
```

### 4. TypeScript Errors

If you encounter TypeScript errors in tests, ensure you're importing the correct types:

```typescript
import type { RenderResult } from '@testing-library/react';
import type { MyComponentProps } from '../MyComponent';
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

When adding new features, please ensure:

1. **Write tests first** (TDD approach)
2. **Cover all code paths** (happy path, error cases, edge cases)
3. **Use descriptive test names**
4. **Follow testing best practices**
5. **Maintain coverage thresholds**

For questions about testing, please refer to this guide or create an issue in the repository.
