# Project Structure

This document provides an overview of the DealerBuilt Enterprise Dashboard project structure and organization.

## Root Directory

```
dealerbuilt-enterprise-dashboard/
├── dealerbuilt-dashboard/          # Frontend React application
├── dealerbuilt-api-service/        # Backend Flask API service
├── docker-compose.yml              # Docker Compose configuration
├── deploy.sh                       # Deployment automation script
├── .env.example                    # Environment configuration template
├── README.md                       # Main project documentation
├── USER_GUIDE.md                   # Comprehensive user guide
├── INSTALLATION.md                 # Installation instructions
├── CHANGELOG.md                    # Version history and changes
├── LICENSE                         # MIT license
└── PROJECT_STRUCTURE.md            # This file
```

## Frontend Application (`dealerbuilt-dashboard/`)

### Directory Structure
```
dealerbuilt-dashboard/
├── public/                         # Static assets
│   ├── favicon.ico
│   └── index.html
├── src/                           # Source code
│   ├── components/                # Reusable React components
│   │   ├── auth/                  # Authentication components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── dashboard/             # Dashboard-specific components
│   │   │   ├── CommandPalette.jsx
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── DashboardSidebar.jsx
│   │   │   └── NotificationCenter.jsx
│   │   └── ui/                    # UI components (Shadcn/UI)
│   ├── contexts/                  # React contexts
│   │   ├── AuthContext.jsx        # Authentication state management
│   │   └── DashboardContext.jsx   # Dashboard state management
│   ├── data/                      # Mock data and constants
│   │   ├── mockEmployeeData.js
│   │   └── mockOrganizationData.js
│   ├── layouts/                   # Layout components
│   │   └── DashboardLayout.jsx
│   ├── lib/                       # Utility libraries
│   │   └── utils.js
│   ├── pages/                     # Page components
│   │   ├── auth/                  # Authentication pages
│   │   │   └── LoginPage.jsx
│   │   └── dashboards/            # Dashboard pages
│   │       ├── ExecutiveDashboard.jsx
│   │       ├── ServiceDashboard.jsx
│   │       ├── SalesDashboard.jsx
│   │       ├── PartsDashboard.jsx
│   │       └── FinanceDashboard.jsx
│   ├── services/                  # API and service functions
│   │   └── mockAuthService.js
│   ├── App.jsx                    # Main application component
│   ├── App.css                    # Global styles
│   └── main.jsx                   # Application entry point
├── package.json                   # Node.js dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── Dockerfile                     # Docker configuration for frontend
└── nginx.conf                     # Nginx configuration
```

### Key Frontend Technologies
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: High-quality UI component library
- **Recharts**: Composable charting library for React
- **Lucide React**: Beautiful and consistent icon library

### Component Architecture
- **Atomic Design**: Components organized by complexity and reusability
- **Context API**: Global state management for authentication and dashboard data
- **Protected Routes**: Role-based access control for different user types
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## Backend API Service (`dealerbuilt-api-service/`)

### Directory Structure
```
dealerbuilt-api-service/
├── src/                           # Source code
│   ├── models/                    # Database models
│   │   └── user.py                # User model
│   ├── routes/                    # API route handlers
│   │   ├── user.py                # User routes
│   │   └── dashboard.py           # Dashboard API routes
│   ├── services/                  # Business logic services
│   │   └── dealerbuilt_api.py     # DealerBuilt API integration
│   ├── static/                    # Static files (for full-stack deployment)
│   ├── database/                  # Database files
│   │   └── app.db                 # SQLite database
│   └── main.py                    # Flask application entry point
├── venv/                          # Python virtual environment
├── requirements.txt               # Python dependencies
└── Dockerfile                     # Docker configuration for backend
```

### Key Backend Technologies
- **Flask**: Lightweight and flexible Python web framework
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Flask-CORS**: Cross-Origin Resource Sharing support
- **Requests**: HTTP library for API integration
- **Gunicorn**: Python WSGI HTTP Server for production

### API Architecture
- **RESTful Design**: Clean and consistent API endpoints
- **SOAP Integration**: Custom SOAP client for DealerBuilt API
- **Caching Layer**: Redis-based caching for performance
- **Error Handling**: Comprehensive error handling and logging
- **Security**: CORS, input validation, and authentication middleware

## Configuration Files

### Docker Configuration
- **`docker-compose.yml`**: Multi-service orchestration
  - Frontend (Nginx + React)
  - Backend (Flask + Gunicorn)
  - Database (PostgreSQL)
  - Cache (Redis)
  - Network configuration
  - Volume management
  - Health checks

### Environment Configuration
- **`.env.example`**: Template for environment variables
  - DealerBuilt API credentials
  - Database configuration
  - Security settings
  - Feature flags
  - Monitoring configuration

### Deployment Configuration
- **`deploy.sh`**: Automated deployment script
  - Docker environment checks
  - Service orchestration
  - Health monitoring
  - Backup procedures
  - Log management

## Documentation Structure

### User Documentation
- **`README.md`**: Project overview and quick start guide
- **`USER_GUIDE.md`**: Comprehensive user manual
- **`INSTALLATION.md`**: Detailed installation instructions

### Technical Documentation
- **`CHANGELOG.md`**: Version history and feature tracking
- **`PROJECT_STRUCTURE.md`**: This architectural overview
- **`LICENSE`**: MIT license terms

## Data Flow Architecture

### Frontend to Backend
1. **User Interaction**: User interacts with React components
2. **State Management**: Context API manages application state
3. **API Calls**: Frontend makes REST API calls to Flask backend
4. **Authentication**: JWT tokens for secure communication

### Backend to DealerBuilt API
1. **API Gateway**: Flask backend acts as API gateway
2. **SOAP Integration**: Custom SOAP client communicates with DealerBuilt
3. **Data Processing**: Backend processes and transforms API responses
4. **Caching**: Redis caches frequently accessed data
5. **Database**: PostgreSQL stores application data and user information

### Real-Time Updates
1. **Polling**: Frontend polls backend for real-time data updates
2. **Caching Strategy**: Backend implements intelligent caching
3. **Notification System**: Real-time alerts and notifications
4. **Performance Optimization**: Efficient data synchronization

## Security Architecture

### Authentication & Authorization
- **Role-Based Access Control**: Executive, Manager, Staff roles
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Secure session handling
- **Password Security**: Bcrypt hashing for passwords

### API Security
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API abuse prevention
- **Error Handling**: Secure error responses

### Infrastructure Security
- **HTTPS/SSL**: Encrypted communications
- **Container Security**: Non-root users in containers
- **Network Isolation**: Docker network segmentation
- **Security Headers**: HSTS, CSP, and other security headers

## Performance Architecture

### Frontend Performance
- **Code Splitting**: Lazy loading of components
- **Asset Optimization**: Minification and compression
- **Caching Strategy**: Browser caching for static assets
- **Bundle Optimization**: Tree shaking and dead code elimination

### Backend Performance
- **Connection Pooling**: Database connection optimization
- **Caching Layer**: Redis for high-performance caching
- **Query Optimization**: Efficient database queries
- **Response Compression**: Gzip compression for API responses

### Infrastructure Performance
- **Load Balancing**: Horizontal scaling support
- **Resource Optimization**: Efficient memory and CPU usage
- **Health Monitoring**: Performance monitoring and alerting
- **Scalability**: Container orchestration for scaling

## Development Workflow

### Local Development
1. **Environment Setup**: Clone repository and configure environment
2. **Service Startup**: Start frontend and backend services
3. **Development Server**: Hot reload for rapid development
4. **Testing**: Unit and integration testing
5. **Debugging**: Comprehensive logging and debugging tools

### Production Deployment
1. **Build Process**: Automated build and optimization
2. **Containerization**: Docker image creation
3. **Orchestration**: Docker Compose service management
4. **Health Checks**: Automated health monitoring
5. **Monitoring**: Performance and error monitoring

## Maintenance and Operations

### Monitoring
- **Health Checks**: Automated service health monitoring
- **Log Management**: Centralized logging and analysis
- **Performance Metrics**: Resource usage and performance tracking
- **Error Tracking**: Comprehensive error monitoring and alerting

### Backup and Recovery
- **Automated Backups**: Scheduled database and application backups
- **Point-in-Time Recovery**: Database recovery capabilities
- **Disaster Recovery**: Complete system recovery procedures
- **Data Integrity**: Backup verification and testing

### Updates and Maintenance
- **Version Control**: Git-based version management
- **Automated Updates**: Scripted update procedures
- **Rollback Capability**: Safe rollback to previous versions
- **Security Updates**: Regular security patch management

## Extensibility and Customization

### Plugin Architecture
- **Modular Design**: Component-based architecture for easy extension
- **API Extensibility**: RESTful API for third-party integrations
- **Custom Dashboards**: Configurable dashboard layouts
- **Widget System**: Custom widget development support

### Integration Points
- **API Gateway**: Standardized API for external integrations
- **Webhook Support**: Event-driven integration capabilities
- **Data Export**: Multiple export formats for data integration
- **SSO Integration**: Single sign-on integration support

This project structure provides a solid foundation for enterprise-grade dashboard development with clear separation of concerns, scalable architecture, and comprehensive documentation.

