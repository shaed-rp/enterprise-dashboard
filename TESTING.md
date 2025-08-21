# Testing Guide
## DealerX Enterprise Dashboard

This guide provides comprehensive testing procedures and guidelines for the DealerX Enterprise Dashboard, covering unit testing, integration testing, end-to-end testing, performance testing, and security testing.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [API Testing](#api-testing)
8. [Frontend Testing](#frontend-testing)
9. [Backend Testing](#backend-testing)
10. [Test Data Management](#test-data-management)
11. [Continuous Integration](#continuous-integration)
12. [Test Reporting](#test-reporting)

## Testing Strategy

### Testing Pyramid
Our testing strategy follows the testing pyramid approach:

```
    /\
   /  \     E2E Tests (Few)
  /____\    Integration Tests (Some)
 /______\   Unit Tests (Many)
```

### Test Categories
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Test system performance under load
- **Security Tests**: Test security vulnerabilities

### Testing Tools
- **Frontend**: Jest, React Testing Library, Cypress
- **Backend**: pytest, Flask-Testing, Locust
- **API**: Postman, Newman, REST Assured
- **Security**: OWASP ZAP, Bandit
- **Performance**: Apache JMeter, Artillery

## Unit Testing

### Frontend Unit Testing

#### Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

#### Component Testing
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  test('renders correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    render(<ComponentName prop1="test" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('clicked')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    render(<ComponentName prop1="test" loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// useCustomHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  test('returns initial state', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(0);
  });

  test('updates state correctly', () => {
    const { result } = renderHook(() => useCustomHook());
    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toBe(1);
  });
});
```

### Backend Unit Testing

#### Setup
```bash
# Install testing dependencies
pip install pytest pytest-cov pytest-mock

# Run tests
python -m pytest tests/

# Run with coverage
python -m pytest --cov=src tests/

# Generate HTML coverage report
python -m pytest --cov=src --cov-report=html tests/
```

#### Service Testing
```python
# test_dealerbuilt_api.py
import pytest
from unittest.mock import Mock, patch
from src.services.dealerbuilt_api import DealerBuiltAPIService

class TestDealerBuiltAPIService:
    @pytest.fixture
    def api_service(self):
        config = {
            'username': 'test_user',
            'password': 'test_pass',
            'source_id': 'TEST_SOURCE',
            'company_id': 'TEST_COMPANY',
            'store_id': 'TEST_STORE',
            'service_location_id': 'TEST_SERVICE_LOC'
        }
        return DealerBuiltAPIService(config)

    def test_init(self, api_service):
        assert api_service.username == 'test_user'
        assert api_service.password == 'test_pass'

    @patch('requests.Session.post')
    def test_make_api_request_success(self, mock_post, api_service):
        mock_response = Mock()
        mock_response.text = '<soap:Envelope><soap:Body><result>success</result></soap:Body></soap:Envelope>'
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        result = api_service._make_api_request('TestMethod')
        assert 'result' in result

    @patch('requests.Session.post')
    def test_make_api_request_error(self, mock_post, api_service):
        mock_post.side_effect = Exception('API Error')
        
        result = api_service._make_api_request('TestMethod')
        assert 'error' in result
```

#### Route Testing
```python
# test_dashboard_routes.py
import pytest
from src.main import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/api/dashboard/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'success'
    assert data['data']['status'] == 'healthy'

def test_executive_summary(client):
    response = client.get('/api/dashboard/executive/summary')
    assert response.status_code == 200
    data = response.get_json()
    assert 'revenue' in data['data']
    assert 'units' in data['data']

def test_service_summary(client):
    response = client.get('/api/dashboard/service/summary')
    assert response.status_code == 200
    data = response.get_json()
    assert 'active_ros' in data['data']
    assert 'technicians' in data['data']
```

## Integration Testing

### API Integration Testing

#### Setup
```bash
# Install integration testing tools
pip install requests pytest-asyncio

# Run integration tests
python -m pytest tests/integration/ -v
```

#### API Endpoint Testing
```python
# test_api_integration.py
import pytest
import requests
from typing import Dict, Any

class TestAPIIntegration:
    BASE_URL = 'http://localhost:5000/api'
    
    def test_health_endpoint(self):
        response = requests.get(f'{self.BASE_URL}/dashboard/health')
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
    
    def test_executive_summary_endpoint(self):
        response = requests.get(f'{self.BASE_URL}/dashboard/executive/summary')
        assert response.status_code == 200
        data = response.json()
        assert 'revenue' in data['data']
        assert 'units' in data['data']
        assert 'gross_profit' in data['data']
    
    def test_service_summary_endpoint(self):
        response = requests.get(f'{self.BASE_URL}/dashboard/service/summary')
        assert response.status_code == 200
        data = response.json()
        assert 'active_ros' in data['data']
        assert 'technicians' in data['data']
    
    def test_realtime_alerts_endpoint(self):
        response = requests.get(f'{self.BASE_URL}/dashboard/realtime/alerts')
        assert response.status_code == 200
        data = response.json()
        assert 'data' in data
        assert isinstance(data['data'], list)
```

#### Database Integration Testing
```python
# test_database_integration.py
import pytest
from src.models.user import db, User
from src.main import app

@pytest.fixture
def app_context():
    with app.app_context():
        yield

@pytest.fixture
def db_session(app_context):
    db.create_all()
    yield db.session
    db.session.remove()
    db.drop_all()

def test_user_creation(db_session):
    user = User(
        username='testuser',
        email='test@example.com',
        role='executive'
    )
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.username == 'testuser'

def test_user_query(db_session):
    user = User(
        username='testuser',
        email='test@example.com',
        role='executive'
    )
    db_session.add(user)
    db_session.commit()
    
    found_user = User.query.filter_by(username='testuser').first()
    assert found_user is not None
    assert found_user.email == 'test@example.com'
```

### Frontend Integration Testing

#### Component Integration Testing
```typescript
// ComponentIntegration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardProvider } from '../contexts/DashboardContext';
import { ExecutiveDashboard } from '../pages/dashboards/ExecutiveDashboard';

describe('ExecutiveDashboard Integration', () => {
  test('loads and displays dashboard data', async () => {
    render(
      <DashboardProvider>
        <ExecutiveDashboard />
      </DashboardProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Units Sold')).toBeInTheDocument();
  });

  test('handles data loading states', async () => {
    render(
      <DashboardProvider>
        <ExecutiveDashboard />
      </DashboardProvider>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

### Cypress Setup

#### Installation
```bash
# Install Cypress
npm install --save-dev cypress

# Open Cypress
npx cypress open

# Run tests headlessly
npx cypress run
```

#### Test Configuration
```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

#### E2E Test Examples
```javascript
// cypress/e2e/dashboard.cy.js
describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('executive', 'demo123');
  });

  it('should load executive dashboard', () => {
    cy.visit('/dashboard/executive');
    cy.get('[data-testid="executive-dashboard"]').should('be.visible');
    cy.get('[data-testid="revenue-card"]').should('contain', 'Total Revenue');
    cy.get('[data-testid="units-card"]').should('contain', 'Units Sold');
  });

  it('should navigate between dashboards', () => {
    cy.visit('/dashboard/executive');
    cy.get('[data-testid="service-dashboard-link"]').click();
    cy.url().should('include', '/dashboard/service');
    cy.get('[data-testid="service-dashboard"]').should('be.visible');
  });

  it('should display real-time alerts', () => {
    cy.visit('/dashboard/executive');
    cy.get('[data-testid="alerts-panel"]').should('be.visible');
    cy.get('[data-testid="alert-item"]').should('have.length.greaterThan', 0);
  });

  it('should handle authentication', () => {
    cy.visit('/login');
    cy.get('[data-testid="username-input"]').type('executive');
    cy.get('[data-testid="password-input"]').type('demo123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard/executive');
  });
});
```

```javascript
// cypress/e2e/api.cy.js
describe('API E2E Tests', () => {
  it('should fetch executive summary data', () => {
    cy.request('GET', '/api/dashboard/executive/summary').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('success');
      expect(response.body.data).to.have.property('revenue');
      expect(response.body.data).to.have.property('units');
    });
  });

  it('should fetch service summary data', () => {
    cy.request('GET', '/api/dashboard/service/summary').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('success');
      expect(response.body.data).to.have.property('active_ros');
      expect(response.body.data).to.have.property('technicians');
    });
  });

  it('should handle API errors gracefully', () => {
    cy.request({
      method: 'GET',
      url: '/api/dashboard/nonexistent',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
```

## Performance Testing

### Load Testing with Artillery

#### Setup
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-tests/dashboard-load.yml
```

#### Load Test Configuration
```yaml
# load-tests/dashboard-load.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Dashboard API Load Test"
    weight: 70
    flow:
      - get:
          url: "/api/dashboard/health"
      - think: 1
      - get:
          url: "/api/dashboard/executive/summary"
      - think: 2
      - get:
          url: "/api/dashboard/realtime/kpis"

  - name: "Service API Load Test"
    weight: 30
    flow:
      - get:
          url: "/api/dashboard/service/summary"
      - think: 1
      - get:
          url: "/api/dashboard/realtime/alerts"
```

### Performance Benchmarks

#### API Response Time Testing
```python
# test_performance.py
import time
import requests
import statistics

def test_api_response_times():
    endpoints = [
        '/api/dashboard/health',
        '/api/dashboard/executive/summary',
        '/api/dashboard/service/summary',
        '/api/dashboard/sales/summary',
        '/api/dashboard/parts/summary'
    ]
    
    base_url = 'http://localhost:5000'
    response_times = {}
    
    for endpoint in endpoints:
        times = []
        for _ in range(100):
            start_time = time.time()
            response = requests.get(f'{base_url}{endpoint}')
            end_time = time.time()
            
            assert response.status_code == 200
            times.append((end_time - start_time) * 1000)  # Convert to ms
        
        response_times[endpoint] = {
            'mean': statistics.mean(times),
            'median': statistics.median(times),
            'p95': statistics.quantiles(times, n=20)[18],  # 95th percentile
            'p99': statistics.quantiles(times, n=100)[98]  # 99th percentile
        }
    
    # Assert performance requirements
    for endpoint, metrics in response_times.items():
        assert metrics['p95'] < 500, f"{endpoint} P95 response time {metrics['p95']}ms exceeds 500ms"
        assert metrics['p99'] < 1000, f"{endpoint} P99 response time {metrics['p99']}ms exceeds 1000ms"
    
    return response_times
```

#### Frontend Performance Testing
```javascript
// performance.test.js
import { render } from '@testing-library/react';
import { ExecutiveDashboard } from '../pages/dashboards/ExecutiveDashboard';

describe('Performance Tests', () => {
  test('dashboard renders within performance budget', () => {
    const startTime = performance.now();
    
    render(<ExecutiveDashboard />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // 100ms budget
  });

  test('dashboard memory usage is within limits', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    render(<ExecutiveDashboard />);
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB limit
  });
});
```

## Security Testing

### OWASP ZAP Security Testing

#### Setup
```bash
# Install OWASP ZAP
# Download from https://owasp.org/www-project-zap/

# Run security scan
zap-baseline.py -t http://localhost:5000 -J baseline-report.json
```

#### Security Test Configuration
```yaml
# security-tests/security-scan.yml
target: http://localhost:5000
scanners:
  - sql-injection
  - xss
  - csrf
  - authentication
  - authorization
  - input-validation

endpoints:
  - /api/dashboard/health
  - /api/dashboard/executive/summary
  - /api/dashboard/service/summary
  - /api/dashboard/sales/summary
  - /api/dashboard/parts/summary
```

### Security Test Examples

#### Input Validation Testing
```python
# test_security.py
import pytest
import requests
import json

class TestSecurity:
    BASE_URL = 'http://localhost:5000/api'
    
    def test_sql_injection_prevention(self):
        # Test SQL injection attempts
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --"
        ]
        
        for malicious_input in malicious_inputs:
            response = requests.get(
                f'{self.BASE_URL}/dashboard/customers',
                params={'search': malicious_input}
            )
            # Should not return 500 error (SQL error)
            assert response.status_code != 500
    
    def test_xss_prevention(self):
        # Test XSS attempts
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>"
        ]
        
        for payload in xss_payloads:
            response = requests.get(
                f'{self.BASE_URL}/dashboard/customers',
                params={'search': payload}
            )
            # Response should not contain the script
            assert payload not in response.text
    
    def test_authentication_required(self):
        # Test endpoints that require authentication
        protected_endpoints = [
            '/api/dashboard/executive/summary',
            '/api/dashboard/service/summary',
            '/api/dashboard/sales/summary'
        ]
        
        for endpoint in protected_endpoints:
            response = requests.get(f'{self.BASE_URL}{endpoint}')
            # Should require authentication
            assert response.status_code in [401, 403]
    
    def test_cors_configuration(self):
        # Test CORS headers
        response = requests.options(
            f'{self.BASE_URL}/dashboard/health',
            headers={'Origin': 'http://malicious-site.com'}
        )
        
        # CORS should be properly configured
        assert 'Access-Control-Allow-Origin' in response.headers
```

#### Authentication Testing
```python
# test_authentication.py
import pytest
import requests
import jwt

class TestAuthentication:
    BASE_URL = 'http://localhost:5000/api'
    
    def test_valid_login(self):
        login_data = {
            'username': 'executive',
            'password': 'demo123'
        }
        
        response = requests.post(
            f'{self.BASE_URL}/auth/login',
            json=login_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert 'token' in data
    
    def test_invalid_login(self):
        login_data = {
            'username': 'invalid',
            'password': 'wrong'
        }
        
        response = requests.post(
            f'{self.BASE_URL}/auth/login',
            json=login_data
        )
        
        assert response.status_code == 401
    
    def test_token_validation(self):
        # Get valid token
        login_response = requests.post(
            f'{self.BASE_URL}/auth/login',
            json={'username': 'executive', 'password': 'demo123'}
        )
        token = login_response.json()['token']
        
        # Test with valid token
        response = requests.get(
            f'{self.BASE_URL}/dashboard/executive/summary',
            headers={'Authorization': f'Bearer {token}'}
        )
        assert response.status_code == 200
        
        # Test with invalid token
        response = requests.get(
            f'{self.BASE_URL}/dashboard/executive/summary',
            headers={'Authorization': 'Bearer invalid_token'}
        )
        assert response.status_code == 401
```

## API Testing

### Postman Collection

#### Collection Setup
```json
{
  "info": {
    "name": "DealerBuilt Dashboard API",
    "description": "API tests for DealerBuilt Dashboard",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/dashboard/health"
      },
      "response": [
        {
          "name": "Success",
          "originalRequest": {
            "method": "GET",
            "url": "{{baseUrl}}/api/dashboard/health"
          },
          "status": "OK",
          "code": 200,
          "_postman_previewlanguage": "json",
          "header": [
            {
              "key": "Content-Type",
              "value": "application/json"
            }
          ],
          "body": "{\n  \"status\": \"success\",\n  \"data\": {\n    \"status\": \"healthy\",\n    \"service\": \"DealerBuilt Dashboard API\"\n  }\n}"
        }
      ]
    }
  ]
}
```

#### Newman CLI Testing
```bash
# Install Newman
npm install -g newman

# Run Postman collection
newman run DealerBuilt-Dashboard-API.postman_collection.json \
  --environment local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

## Frontend Testing

### Component Testing Best Practices

#### Test Structure
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Setup mocks, reset state, etc.
  });

  afterEach(() => {
    // Cleanup
  });

  // Test cases
  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      render(<ComponentName />);
      expect(screen.getByTestId('component')).toBeInTheDocument();
    });

    test('renders with custom props', () => {
      render(<ComponentName title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles button click', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();
      
      render(<ComponentName onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('handles form submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      render(<ComponentName onSubmit={mockOnSubmit} />);
      
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await user.type(input, 'test value');
      await user.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith('test value');
    });
  });

  describe('Error Handling', () => {
    test('displays error message', () => {
      render(<ComponentName error="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('handles loading state', () => {
      render(<ComponentName loading={true} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});
```

## Backend Testing

### Flask Application Testing

#### Test Configuration
```python
# conftest.py
import pytest
from src.main import app
from src.models.user import db

@pytest.fixture
def app_context():
    with app.app_context():
        yield

@pytest.fixture
def client(app_context):
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    with app.test_client() as client:
        yield client

@pytest.fixture
def db_session(app_context):
    db.create_all()
    yield db.session
    db.session.remove()
    db.drop_all()
```

#### Service Layer Testing
```python
# test_services.py
import pytest
from unittest.mock import Mock, patch
from src.services.dealerbuilt_api import DealerBuiltAPIService

class TestDealerBuiltAPIService:
    @pytest.fixture
    def mock_api_service(self):
        with patch('src.services.dealerbuilt_api.requests.Session') as mock_session:
            service = DealerBuiltAPIService({
                'username': 'test',
                'password': 'test',
                'source_id': 'test',
                'company_id': 'test',
                'store_id': 'test',
                'service_location_id': 'test'
            })
            yield service, mock_session

    def test_get_executive_summary(self, mock_api_service):
        service, mock_session = mock_api_service
        
        # Mock successful API response
        mock_response = Mock()
        mock_response.text = '<soap:Envelope><soap:Body><result>success</result></soap:Body></soap:Envelope>'
        mock_session.return_value.post.return_value = mock_response
        
        result = service.get_executive_summary()
        
        assert 'revenue' in result
        assert 'units' in result
        assert 'gross_profit' in result

    def test_api_error_handling(self, mock_api_service):
        service, mock_session = mock_api_service
        
        # Mock API error
        mock_session.return_value.post.side_effect = Exception('API Error')
        
        result = service.get_executive_summary()
        
        assert 'error' in result
```

## Test Data Management

### Test Data Setup

#### Fixtures
```python
# test_fixtures.py
import pytest
from src.models.user import User

@pytest.fixture
def sample_users(db_session):
    users = [
        User(username='executive', email='executive@example.com', role='executive'),
        User(username='manager', email='manager@example.com', role='manager'),
        User(username='staff', email='staff@example.com', role='staff')
    ]
    
    for user in users:
        db_session.add(user)
    db_session.commit()
    
    return users

@pytest.fixture
def mock_api_data():
    return {
        'executive_summary': {
            'revenue': {'current': 2847500, 'previous': 2654000, 'target': 3000000},
            'units': {'current': 156, 'previous': 142, 'target': 180},
            'gross_profit': {'current': 487200, 'previous': 445800, 'target': 520000}
        },
        'service_summary': {
            'active_ros': 47,
            'todays_appointments': 23,
            'technicians': {'active': 12, 'total': 14}
        }
    }
```

#### Test Data Cleanup
```python
# test_cleanup.py
import pytest
import tempfile
import shutil
import os

@pytest.fixture(scope='function')
def temp_dir():
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)

@pytest.fixture(scope='function')
def clean_database(db_session):
    yield db_session
    # Cleanup is handled by db_session fixture
```

## Continuous Integration

### GitHub Actions Configuration

#### Test Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: dealerbuilt-dashboard/package-lock.json
    
    - name: Install Python dependencies
      run: |
        cd dealerbuilt-api-service
        pip install -r requirements.txt
        pip install pytest pytest-cov pytest-mock
    
    - name: Install Node.js dependencies
      run: |
        cd dealerbuilt-dashboard
        npm ci
    
    - name: Run backend tests
      run: |
        cd dealerbuilt-api-service
        python -m pytest tests/ --cov=src --cov-report=xml
    
    - name: Run frontend tests
      run: |
        cd dealerbuilt-dashboard
        npm test -- --coverage --watchAll=false
    
    - name: Run E2E tests
      run: |
        cd dealerbuilt-dashboard
        npm run build
        npx cypress run
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./dealerbuilt-api-service/coverage.xml
        flags: backend
        name: backend-coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./dealerbuilt-dashboard/coverage/lcov.info
        flags: frontend
        name: frontend-coverage
```

## Test Reporting

### Coverage Reports

#### Backend Coverage
```bash
# Generate coverage report
python -m pytest --cov=src --cov-report=html --cov-report=term-missing tests/

# Coverage report will be available in htmlcov/index.html
```

#### Frontend Coverage
```bash
# Generate coverage report
npm test -- --coverage --watchAll=false

# Coverage report will be available in coverage/lcov-report/index.html
```

### Test Results Reporting

#### JUnit XML Reports
```yaml
# pytest.ini
[tool:pytest]
addopts = 
    --junitxml=test-results.xml
    --cov=src
    --cov-report=xml
    --cov-report=html
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  testResultsProcessor: 'jest-junit',
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
    }],
  ],
};
```

---

**Testing Guide Version**: 1.0.0  
**Last Updated**: August 2025  
**Maintained by**: Development Team
