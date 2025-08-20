# DealerBuilt Enterprise Dashboard

A comprehensive, enterprise-grade dashboard solution that integrates with the DealerBuilt API to provide real-time insights and operational management for automotive dealerships.

## 🚀 Features

### Executive Dashboard
- **Real-time KPI Monitoring**: Revenue, units sold, gross profit, customer satisfaction
- **Performance Analytics**: Trend analysis, department comparisons, location performance
- **Interactive Visualizations**: Charts, graphs, and data tables with drill-down capabilities
- **Alert System**: Real-time notifications for critical business events

### Role-Based Access Control
- **Executive Level**: Complete access to all dashboards and analytics
- **Department Managers**: Access to relevant departmental data and operations
- **Staff Level**: Limited access to operational tools and basic reporting
- **Customizable Permissions**: Fine-grained control over feature access

### Modern UI/UX
- **ChatGPT-Style Interface**: Intuitive sidebar navigation with collapsible sections
- **Apple-Inspired Design**: Clean, modern aesthetic with smooth animations
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Command Palette**: Quick navigation and search functionality (⌘K)

### API Integration
- **DealerBuilt SOAP API**: Complete integration with all 103+ API endpoints
- **Real-time Data**: Live updates from dealership management systems
- **Caching Layer**: Optimized performance with intelligent data caching
- **Error Handling**: Robust error management and retry mechanisms

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with Vite for fast development and building
- **UI Components**: Shadcn/UI with Tailwind CSS for consistent design
- **State Management**: Context API for global state and user management
- **Charts**: Recharts for data visualizations
- **Icons**: Lucide React for consistent iconography

### Backend (Flask)
- **Framework**: Flask with Gunicorn for production deployment
- **API Integration**: Custom SOAP client for DealerBuilt API communication
- **Database**: SQLite for development, PostgreSQL for production
- **Caching**: Redis for high-performance data caching
- **Security**: CORS enabled, authentication middleware, input validation

### Infrastructure
- **Containerization**: Docker and Docker Compose for easy deployment
- **Web Server**: Nginx for frontend serving and API proxying
- **SSL/TLS**: HTTPS support with automatic certificate management
- **Monitoring**: Health checks and logging for all services

## 📋 Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- DealerBuilt API credentials (username, password, organization IDs)
- Minimum 4GB RAM and 2 CPU cores for production deployment
- Domain name and SSL certificate for HTTPS (production)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd dealerbuilt-enterprise-dashboard
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` file with your DealerBuilt API credentials:
```bash
DEALERBUILT_USERNAME=your_username
DEALERBUILT_PASSWORD=your_password
DEALERBUILT_SOURCE_ID=your_source_id
DEALERBUILT_COMPANY_ID=your_company_id
DEALERBUILT_STORE_ID=your_store_id
DEALERBUILT_SERVICE_LOCATION_ID=your_service_location_id
```

### 3. Deploy
```bash
./deploy.sh deploy
```

### 4. Access Dashboard
- **Dashboard**: http://localhost
- **API Health**: http://localhost/api/dashboard/health
- **API Documentation**: http://localhost/api/docs

## 🔧 Development

### Frontend Development
```bash
cd dealerbuilt-dashboard
npm install
npm run dev
```

### Backend Development
```bash
cd dealerbuilt-api-service
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

### Testing API Integration
```bash
# Test API connection
curl http://localhost:5000/api/dashboard/health

# Test executive summary
curl http://localhost:5000/api/dashboard/executive/summary

# Test service operations
curl http://localhost:5000/api/dashboard/service/summary
```

## 📊 API Endpoints

### Dashboard Data
- `GET /api/dashboard/health` - Service health check
- `GET /api/dashboard/executive/summary` - Executive dashboard data
- `GET /api/dashboard/service/summary` - Service operations data
- `GET /api/dashboard/sales/summary` - Sales performance data
- `GET /api/dashboard/parts/summary` - Parts management data

### Real-time Data
- `GET /api/dashboard/realtime/alerts` - Current alerts and notifications
- `GET /api/dashboard/realtime/kpis` - Live KPI updates
- `GET /api/dashboard/analytics/trends` - Trend analysis data

### Operational Data
- `GET /api/dashboard/customers` - Customer list and details
- `GET /api/dashboard/inventory` - Vehicle inventory data
- `POST /api/dashboard/cache/clear` - Clear API cache

## 🔐 Security

### Authentication
- Role-based access control with JWT tokens
- Session management with secure cookies
- Password hashing with bcrypt

### API Security
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- Input validation and sanitization
- SQL injection prevention

### Infrastructure Security
- HTTPS encryption for all communications
- Security headers (HSTS, CSP, X-Frame-Options)
- Container security with non-root users
- Network isolation with Docker networks

## 🚀 Deployment

### Production Deployment
```bash
# Set production environment
export FLASK_ENV=production

# Deploy with SSL
./deploy.sh deploy

# Check status
./deploy.sh status

# View logs
./deploy.sh logs
```

### Scaling
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Add load balancer
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Monitoring
```bash
# Check service health
./deploy.sh health

# View real-time logs
./deploy.sh logs backend

# Create backup
./deploy.sh backup
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DEALERBUILT_USERNAME` | DealerBuilt API username | `demo_user` |
| `DEALERBUILT_PASSWORD` | DealerBuilt API password | `demo_password` |
| `DEALERBUILT_SOURCE_ID` | Source identifier | `DEMO_SOURCE` |
| `DEALERBUILT_COMPANY_ID` | Company identifier | `DEMO_COMPANY` |
| `DEALERBUILT_STORE_ID` | Store identifier | `DEMO_STORE` |
| `DEALERBUILT_SERVICE_LOCATION_ID` | Service location ID | `DEMO_SERVICE_LOC` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `dealerbuilt_secure_password` |
| `CACHE_TTL` | Cache time-to-live (seconds) | `600` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Feature Flags
```bash
# Enable/disable features
ENABLE_REAL_TIME_UPDATES=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ADVANCED_ANALYTICS=true
ENABLE_EXPORT_FUNCTIONALITY=true
```

## 📈 Performance

### Optimization Features
- **Intelligent Caching**: Redis-based caching with configurable TTL
- **Database Optimization**: Connection pooling and query optimization
- **Frontend Optimization**: Code splitting, lazy loading, and asset optimization
- **CDN Integration**: Static asset delivery via CDN

### Performance Metrics
- **API Response Time**: < 200ms for cached data, < 2s for fresh data
- **Page Load Time**: < 3s for initial load, < 1s for subsequent navigation
- **Concurrent Users**: Supports 100+ concurrent users per instance
- **Data Throughput**: Handles 1000+ API requests per minute

## 🔍 Troubleshooting

### Common Issues

#### API Connection Errors
```bash
# Check API credentials
curl -X GET http://localhost:5000/api/dashboard/test-connection

# Verify network connectivity
docker-compose exec backend ping cdx.dealerbuilt.com

# Check logs
./deploy.sh logs backend
```

#### Frontend Not Loading
```bash
# Check nginx configuration
docker-compose exec frontend nginx -t

# Verify build process
docker-compose build frontend --no-cache

# Check frontend logs
./deploy.sh logs frontend
```

#### Database Issues
```bash
# Check database connection
docker-compose exec postgres pg_isready -U dealerbuilt

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check cache hit rate
docker-compose exec redis redis-cli info stats

# Analyze slow queries
docker-compose logs backend | grep "slow query"
```

## 📚 Documentation

### API Documentation
- [DealerBuilt API Integration Guide](docs/api-integration.md)
- [Endpoint Reference](docs/api-reference.md)
- [Authentication Guide](docs/authentication.md)

### Development Guides
- [Frontend Development](docs/frontend-development.md)
- [Backend Development](docs/backend-development.md)
- [Testing Guide](docs/testing.md)

### Deployment Guides
- [Production Deployment](docs/production-deployment.md)
- [SSL Configuration](docs/ssl-configuration.md)
- [Monitoring Setup](docs/monitoring.md)

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

### Code Standards
- **Frontend**: ESLint + Prettier for JavaScript/React
- **Backend**: Black + Flake8 for Python
- **Documentation**: Markdown with consistent formatting
- **Commits**: Conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check the docs/ directory for detailed guides
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

### Enterprise Support
For enterprise support, custom development, or professional services, contact the development team.

---

**Built with ❤️ by the DealerBuilt Dashboard Team**

*Empowering automotive dealerships with real-time insights and operational excellence.*

