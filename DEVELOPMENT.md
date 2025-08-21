# Development Guide
## DealerX Enterprise Dashboard

This guide provides comprehensive instructions for setting up and contributing to the DealerX Enterprise Dashboard development environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Code Style Guidelines](#code-style-guidelines)
4. [Git Workflow](#git-workflow)
5. [Debugging Procedures](#debugging-procedures)
6. [Performance Optimization](#performance-optimization)
7. [Testing](#testing)
8. [API Integration Development](#api-integration-development)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **Python**: Version 3.8 or higher
- **Git**: Version 2.30 or higher
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Recommended Tools
- **VS Code**: With extensions for React, Python, and Docker
- **Postman**: For API testing
- **Redis Desktop Manager**: For cache debugging
- **pgAdmin**: For database management

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dealerbuilt-enterprise-dashboard
```

### 2. Frontend Development Setup

```bash
# Navigate to frontend directory
cd dealerbuilt-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Backend Development Setup

```bash
# Navigate to backend directory
cd dealerbuilt-api-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_ENV=development
export DEALERBUILT_USERNAME=your_username
export DEALERBUILT_PASSWORD=your_password
export DEALERBUILT_SOURCE_ID=your_source_id
export DEALERBUILT_COMPANY_ID=your_company_id
export DEALERBUILT_STORE_ID=your_store_id
export DEALERBUILT_SERVICE_LOCATION_ID=your_service_location_id

# Run the application
python src/main.py
```

The backend API will be available at `http://localhost:5000`

### 4. Database Setup

```bash
# Using Docker for PostgreSQL
docker run --name dealerbuilt-postgres \
  -e POSTGRES_DB=dealerbuilt \
  -e POSTGRES_USER=dealerbuilt \
  -e POSTGRES_PASSWORD=dealerbuilt_secure_password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Using Docker for Redis
docker run --name dealerbuilt-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

### 5. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy environment template
cp .env.example .env

# Edit with your actual values
nano .env
```

## Code Style Guidelines

### Frontend (React/TypeScript)

#### General Principles
- Use functional components with hooks
- Prefer TypeScript over JavaScript
- Follow React best practices
- Use meaningful component and variable names

#### Component Structure
```typescript
// Component template
import React from 'react';
import { ComponentProps } from './types';

interface ComponentNameProps {
  // Define props interface
}

export const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Component logic here
  
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};
```

#### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS custom properties for theming

#### State Management
- Use React Context for global state
- Prefer local state for component-specific data
- Use custom hooks for reusable logic
- Avoid prop drilling

### Backend (Python/Flask)

#### Code Style
- Follow PEP 8 guidelines
- Use type hints for function parameters
- Write docstrings for all functions
- Use meaningful variable names

#### Function Structure
```python
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

def function_name(param1: str, param2: Optional[int] = None) -> Dict[str, Any]:
    """
    Brief description of what the function does.
    
    Args:
        param1: Description of param1
        param2: Description of param2 (optional)
        
    Returns:
        Dictionary containing the result
        
    Raises:
        ValueError: When invalid parameters are provided
    """
    try:
        # Function implementation
        result = {}
        return result
    except Exception as e:
        logger.error(f"Error in function_name: {e}")
        raise
```

#### API Design
- Use RESTful principles
- Return consistent JSON responses
- Include proper HTTP status codes
- Implement comprehensive error handling

## Git Workflow

### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `docs/documentation-update` - Documentation changes

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Development Workflow
1. Create feature branch from `main`
2. Make changes and commit with proper messages
3. Push branch and create pull request
4. Request code review
5. Address feedback and merge

### Pull Request Guidelines
- Include clear description of changes
- Reference related issues
- Add screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

## Debugging Procedures

### Frontend Debugging

#### React Developer Tools
```bash
# Install React Developer Tools browser extension
# Available for Chrome and Firefox
```

#### Console Debugging
```typescript
// Use console.log for debugging
console.log('Debug info:', data);

// Use console.error for errors
console.error('Error occurred:', error);

// Use console.table for tabular data
console.table(arrayData);
```

#### React DevTools
- Component tree inspection
- Props and state examination
- Performance profiling
- Hook debugging

### Backend Debugging

#### Flask Debug Mode
```python
# Enable debug mode in development
app.run(debug=True, host='0.0.0.0', port=5000)
```

#### Logging Configuration
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

#### API Testing
```bash
# Test API endpoints
curl -X GET http://localhost:5000/api/dashboard/health

# Test with authentication
curl -X GET http://localhost:5000/api/dashboard/executive/summary \
  -H "Authorization: Bearer your-token"
```

### Database Debugging

#### PostgreSQL
```bash
# Connect to database
docker exec -it dealerbuilt-postgres psql -U dealerbuilt -d dealerbuilt

# View tables
\dt

# Query data
SELECT * FROM users LIMIT 5;
```

#### Redis
```bash
# Connect to Redis
docker exec -it dealerbuilt-redis redis-cli

# View keys
KEYS *

# Get value
GET key_name
```

## Performance Optimization

### Frontend Optimization

#### Code Splitting
```typescript
// Lazy load components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

#### Memoization
```typescript
// Use React.memo for component memoization
const MemoizedComponent = React.memo(ComponentName);

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Use useCallback for function memoization
const memoizedCallback = useCallback(() => {
  doSomething(id);
}, [id]);
```

#### Bundle Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Backend Optimization

#### Database Optimization
```python
# Use connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)
```

#### Caching Strategy
```python
# Implement Redis caching
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_data(key: str) -> Optional[Dict]:
    """Get data from cache"""
    cached = redis_client.get(key)
    return json.loads(cached) if cached else None

def set_cached_data(key: str, data: Dict, ttl: int = 300):
    """Set data in cache with TTL"""
    redis_client.setex(key, ttl, json.dumps(data))
```

#### API Response Optimization
```python
# Use pagination for large datasets
def get_paginated_data(page: int = 1, per_page: int = 20):
    offset = (page - 1) * per_page
    data = query.offset(offset).limit(per_page).all()
    return {
        'data': data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total_count
        }
    }
```

## Testing

### Frontend Testing

#### Unit Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

#### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

test('renders component correctly', () => {
  render(<ComponentName prop1="test" />);
  expect(screen.getByText('test')).toBeInTheDocument();
});
```

### Backend Testing

#### Unit Testing
```bash
# Run Python tests
python -m pytest tests/

# Run with coverage
python -m pytest --cov=src tests/
```

#### API Testing
```python
import pytest
from src.main import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    response = client.get('/api/dashboard/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'
```

## API Integration Development

### Current Implementation Status

The current API integration uses mock data for development purposes. To implement real DMS API integration:

### 1. SOAP Client Implementation

```python
import zeep
from zeep.transports import Transport
from requests import Session

class DealerBuiltSOAPClient:
    def __init__(self, wsdl_url: str, username: str, password: str):
        self.session = Session()
        self.session.auth = (username, password)
        self.transport = Transport(session=self.session)
        self.client = zeep.Client(wsdl_url, transport=self.transport)
    
    def call_method(self, method_name: str, **kwargs):
        """Call SOAP method with parameters"""
        try:
            result = getattr(self.client.service, method_name)(**kwargs)
            return result
        except Exception as e:
            logger.error(f"SOAP call failed for {method_name}: {e}")
            raise
```

### 2. Endpoint Implementation

```python
def get_real_executive_summary(self) -> Dict[str, Any]:
    """Get real executive summary from DMS API"""
    try:
        # Get deals data
        deals_data = self.soap_client.call_method(
            'PullDeals',
            StartDate='2024-01-01',
            EndDate='2024-04-30'
        )
        
        # Get inventory data
        inventory_data = self.soap_client.call_method('PullInventory')
        
        # Process and aggregate data
        return self._process_executive_data(deals_data, inventory_data)
    except Exception as e:
        logger.error(f"Failed to get executive summary: {e}")
        return self._get_mock_data()  # Fallback to mock data
```

### 3. Data Processing

```python
def _process_executive_data(self, deals_data: Any, inventory_data: Any) -> Dict[str, Any]:
    """Process raw API data into dashboard format"""
    # Implement data transformation logic
    processed_data = {
        'revenue': self._calculate_revenue(deals_data),
        'units': self._calculate_units(deals_data),
        'gross_profit': self._calculate_gross_profit(deals_data),
        'customer_satisfaction': self._get_customer_satisfaction()
    }
    return processed_data
```

## Troubleshooting

### Common Issues

#### Frontend Issues

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

**Runtime Errors**
```bash
# Check browser console for errors
# Verify API endpoints are accessible
# Check network tab for failed requests
```

#### Backend Issues

**Import Errors**
```bash
# Verify virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Database Connection Issues**
```bash
# Check database is running
docker ps | grep postgres

# Test connection
python -c "from src.models.user import db; print(db.engine.execute('SELECT 1').scalar())"
```

**API Integration Issues**
```bash
# Test DMS API connection
curl -X GET http://localhost:5000/api/dashboard/test-connection

# Check API credentials
echo $DEALERBUILT_USERNAME
echo $DEALERBUILT_PASSWORD
```

### Performance Issues

#### Frontend Performance
- Use React DevTools Profiler
- Check bundle size with webpack-bundle-analyzer
- Monitor network requests in browser dev tools
- Implement lazy loading for large components

#### Backend Performance
- Monitor database query performance
- Check Redis cache hit rates
- Use Flask-Profiler for API performance
- Monitor memory usage and CPU utilization

### Debugging Tools

#### Frontend Tools
- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab in browser dev tools
- Performance tab for profiling

#### Backend Tools
- Flask-DebugToolbar
- Python debugger (pdb)
- Logging with different levels
- Database query logging

## Getting Help

### Resources
- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [DealerBuilt API Documentation](DealerBuilt%20API%20Comprehensive%20Documentation.md)
- [Project Documentation](README.md)

### Support Channels
- Create GitHub issues for bugs
- Use GitHub Discussions for questions
- Contact development team for urgent issues
- Check troubleshooting guides in documentation

---

**Last Updated**: August 2025  
**Maintained by**: Development Team
