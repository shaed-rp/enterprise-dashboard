# API Reference
## DealerX Enterprise Dashboard Backend

This document provides comprehensive documentation for the DealerX Enterprise Dashboard backend API endpoints, including request/response formats, authentication, error handling, and usage examples.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL and Endpoints](#base-url-and-endpoints)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Dashboard Endpoints](#dashboard-endpoints)
7. [User Management Endpoints](#user-management-endpoints)
8. [Real-time Data Endpoints](#real-time-data-endpoints)
9. [Analytics Endpoints](#analytics-endpoints)
10. [Utility Endpoints](#utility-endpoints)
11. [Rate Limiting](#rate-limiting)
12. [Examples](#examples)

## Overview

The DealerX Enterprise Dashboard API is a RESTful service built with Flask that provides access to dealership data and analytics. The API serves as a middleware between the frontend dashboard and the DealerBuilt SOAP API, providing cached, optimized data for real-time dashboard operations.

### API Version
- **Current Version**: 1.0.0
- **Base URL**: `http://localhost:5000/api`
- **Content Type**: `application/json`
- **Character Encoding**: UTF-8

## Authentication

### Current Implementation
The API currently uses a simplified authentication model for development purposes. In production, implement proper JWT-based authentication.

### Authentication Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

## Base URL and Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoint Categories
- **Dashboard Data**: `/api/dashboard/*`
- **User Management**: `/api/user/*`
- **Real-time Data**: `/api/dashboard/realtime/*`
- **Analytics**: `/api/dashboard/analytics/*`
- **Utilities**: `/api/dashboard/*`

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data here
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

## Error Handling

### HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Codes
- `INVALID_PARAMETERS` - Invalid request parameters
- `AUTHENTICATION_FAILED` - Authentication error
- `PERMISSION_DENIED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Data validation failed
- `API_ERROR` - External API error
- `INTERNAL_ERROR` - Internal server error

## Dashboard Endpoints

### Health Check

#### GET /api/dashboard/health
Check the health status of the API service.

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "service": "DealerBuilt Dashboard API",
    "version": "1.0.0",
    "uptime": "2h 15m 30s"
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Executive Dashboard

#### GET /api/dashboard/executive/summary
Get executive dashboard summary data including KPIs and performance metrics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "revenue": {
      "current": 2847500,
      "previous": 2654000,
      "target": 3000000,
      "trend": [2200000, 2350000, 2654000, 2847500]
    },
    "units": {
      "current": 156,
      "previous": 142,
      "target": 180
    },
    "gross_profit": {
      "current": 487200,
      "previous": 445800,
      "target": 520000
    },
    "customer_satisfaction": {
      "current": 4.7,
      "previous": 4.5,
      "target": 4.8
    },
    "departments": [
      {
        "name": "Sales",
        "revenue": 1847500,
        "percentage": 65
      },
      {
        "name": "Service",
        "revenue": 687200,
        "percentage": 24
      },
      {
        "name": "Parts",
        "revenue": 312800,
        "percentage": 11
      }
    ],
    "locations": [
      {
        "name": "Premier Ford Lincoln",
        "revenue": 847500,
        "units": 45,
        "efficiency": 92
      }
    ]
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Service Operations

#### GET /api/dashboard/service/summary
Get service operations summary data.

**Response:**
```json
{
  "status": "success",
  "data": {
    "active_ros": 47,
    "todays_appointments": 23,
    "avg_cycle_time": "2.4h",
    "technicians": {
      "active": 12,
      "total": 14
    },
    "pending_checkin": 8,
    "efficiency_trend": [85, 88, 92, 89, 91]
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Sales Operations

#### GET /api/dashboard/sales/summary
Get sales operations summary data.

**Response:**
```json
{
  "status": "success",
  "data": {
    "active_deals": 23,
    "monthly_sales": 156,
    "inventory_count": 342,
    "avg_deal_value": 28500,
    "conversion_rate": 0.23,
    "pipeline_value": 2400000
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Parts Management

#### GET /api/dashboard/parts/summary
Get parts management summary data.

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_parts": 15420,
    "low_stock_items": 23,
    "pending_orders": 8,
    "monthly_revenue": 312800,
    "top_movers": [
      {
        "part": "Oil Filter",
        "quantity": 156,
        "revenue": 2340
      }
    ]
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

## User Management Endpoints

### Get Users

#### GET /api/user
Get list of users with pagination support.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Items per page (default: 20)
- `search` (string, optional): Search term for filtering users

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "username": "john.doe",
      "email": "john.doe@example.com",
      "role": "executive",
      "created_at": "2025-01-15T10:30:00Z",
      "last_login": "2025-08-20T09:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "pages": 3
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Get User by ID

#### GET /api/user/{user_id}
Get specific user details.

**Path Parameters:**
- `user_id` (integer, required): User ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@example.com",
    "role": "executive",
    "permissions": ["dashboard:read", "dashboard:write"],
    "created_at": "2025-01-15T10:30:00Z",
    "last_login": "2025-08-20T09:15:00Z"
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

## Real-time Data Endpoints

### Real-time Alerts

#### GET /api/dashboard/realtime/alerts
Get real-time alerts and notifications.

**Query Parameters:**
- `priority` (string, optional): Filter by priority (high, medium, low)
- `department` (string, optional): Filter by department

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "alert_001",
      "type": "warning",
      "title": "Service Capacity Alert",
      "message": "Service capacity at 95% for next week",
      "priority": "high",
      "department": "service",
      "timestamp": "2025-08-20T10:30:00Z"
    }
  ],
  "count": 4,
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Real-time KPIs

#### GET /api/dashboard/realtime/kpis
Get real-time KPI updates.

**Query Parameters:**
- `department` (string, optional): Filter by department (executive, service, sales, parts, all)

**Response:**
```json
{
  "status": "success",
  "data": {
    "executive": {
      "revenue": {
        "current": 2847500,
        "change": 7.3,
        "target_progress": 95
      },
      "units": {
        "current": 156,
        "change": 9.9,
        "target_progress": 87
      },
      "gross_profit": {
        "current": 487200,
        "change": 9.3,
        "target_progress": 94
      },
      "csi": {
        "current": 4.7,
        "change": 4.4,
        "target_progress": 98
      }
    }
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

## Analytics Endpoints

### Trend Analytics

#### GET /api/dashboard/analytics/trends
Get analytics trend data.

**Query Parameters:**
- `metric` (string, required): Metric to analyze (revenue, units, service_efficiency)
- `period` (string, optional): Time period (30d, 90d, 180d, 365d)

**Response:**
```json
{
  "status": "success",
  "data": {
    "metric": "revenue",
    "period": "30d",
    "values": [85000, 92000, 88000, 95000, 91000, 87000, 93000],
    "trend": "up",
    "change_percentage": 7.3
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

## Utility Endpoints

### Test API Connection

#### GET /api/dashboard/test-connection
Test connection to the DMS API.

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "connected",
    "message": "Successfully connected to DMS API",
    "response_time": "245ms"
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Clear Cache

#### POST /api/dashboard/cache/clear
Clear the API cache.

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Cleared 15 cached items",
    "cache_size_before": 15,
    "cache_size_after": 0
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Get Customers

#### GET /api/dashboard/customers
Get customer list with pagination.

**Query Parameters:**
- `limit` (integer, optional): Maximum number of customers (default: 100)
- `search` (string, optional): Search term for filtering customers

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "CUST_0001",
      "name": "Customer 1",
      "email": "customer1@example.com",
      "phone": "555-0001",
      "last_visit": "2025-08-15",
      "total_spent": 1600,
      "vehicle_count": 2
    }
  ],
  "count": 50,
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Get Inventory

#### GET /api/dashboard/inventory
Get vehicle inventory data.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "vin": "1HGBH41JXMN000001",
      "year": 2024,
      "make": "Honda",
      "model": "Civic",
      "trim": "LX",
      "price": 25000,
      "status": "Available",
      "days_in_stock": 15,
      "location": "Premier Honda"
    }
  ],
  "count": 20,
  "timestamp": "2025-08-20T10:30:00Z"
}
```

## Rate Limiting

### Rate Limit Headers
The API implements rate limiting to prevent abuse. Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

### Rate Limit Rules
- **General Endpoints**: 1000 requests per hour
- **Real-time Endpoints**: 100 requests per minute
- **Analytics Endpoints**: 500 requests per hour
- **Utility Endpoints**: 100 requests per hour

### Rate Limit Exceeded Response
```json
{
  "status": "error",
  "message": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600,
  "timestamp": "2025-08-20T10:30:00Z"
}
```

## Examples

### cURL Examples

#### Get Executive Summary
```bash
curl -X GET "http://localhost:5000/api/dashboard/executive/summary" \
  -H "Content-Type: application/json"
```

#### Get Service Summary
```bash
curl -X GET "http://localhost:5000/api/dashboard/service/summary" \
  -H "Content-Type: application/json"
```

#### Get Real-time Alerts
```bash
curl -X GET "http://localhost:5000/api/dashboard/realtime/alerts?priority=high" \
  -H "Content-Type: application/json"
```

#### Clear Cache
```bash
curl -X POST "http://localhost:5000/api/dashboard/cache/clear" \
  -H "Content-Type: application/json"
```

### JavaScript Examples

#### Fetch Executive Data
```javascript
const response = await fetch('/api/dashboard/executive/summary', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data.revenue);
```

#### Fetch Real-time KPIs
```javascript
const response = await fetch('/api/dashboard/realtime/kpis?department=executive', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.executive.revenue);
```

### Python Examples

#### Using requests library
```python
import requests

# Get executive summary
response = requests.get(
    'http://localhost:5000/api/dashboard/executive/summary',
    headers={'Content-Type': 'application/json'}
)

data = response.json()
print(f"Current Revenue: ${data['data']['revenue']['current']:,}")

# Get real-time alerts
response = requests.get(
    'http://localhost:5000/api/dashboard/realtime/alerts',
    params={'priority': 'high'},
    headers={'Content-Type': 'application/json'}
)

alerts = response.json()
for alert in alerts['data']:
    print(f"Alert: {alert['title']} - {alert['message']}")
```

## Implementation Notes

### Current Status
- **API Integration**: Currently using mock data for development
- **Authentication**: Simplified authentication model
- **Caching**: In-memory caching with configurable TTL
- **Error Handling**: Comprehensive error handling implemented
- **Rate Limiting**: Basic rate limiting implemented

### Future Enhancements
- **Real API Integration**: Implement full DealerBuilt SOAP API integration
- **JWT Authentication**: Implement proper JWT-based authentication
- **Redis Caching**: Implement Redis-based caching for production
- **Advanced Rate Limiting**: Implement more sophisticated rate limiting
- **API Versioning**: Implement proper API versioning
- **WebSocket Support**: Add real-time WebSocket support for live updates

### Performance Considerations
- **Response Time**: Target < 200ms for cached responses
- **Concurrent Users**: Support 100+ concurrent users
- **Data Throughput**: Handle 1000+ requests per minute
- **Cache Hit Rate**: Target > 80% cache hit rate

---

**API Version**: 1.0.0  
**Last Updated**: August 2025  
**Maintained by**: Development Team
