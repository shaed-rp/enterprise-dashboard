# Installation Guide - DealerX Enterprise Dashboard

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2
- **Memory**: Minimum 4GB RAM, recommended 8GB+
- **Storage**: Minimum 10GB free space
- **CPU**: 2+ cores recommended
- **Network**: Stable internet connection for API access

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **Text Editor**: For configuration file editing

## Installation Steps

### 1. Install Docker and Docker Compose

#### Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### macOS
```bash
# Install Docker Desktop for Mac
# Download from: https://docs.docker.com/desktop/mac/install/

# Or using Homebrew
brew install --cask docker
```

#### Windows
```bash
# Install Docker Desktop for Windows
# Download from: https://docs.docker.com/desktop/windows/install/

# Or using Chocolatey
choco install docker-desktop
```

### 2. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd dealerbuilt-enterprise-dashboard

# Verify directory structure
ls -la
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration file
nano .env
```

#### Required Configuration
Update the following variables in `.env`:

```bash
# DMS API Credentials
DEALERBUILT_USERNAME=your_actual_username
DEALERBUILT_PASSWORD=your_actual_password
DEALERBUILT_SOURCE_ID=your_source_id
DEALERBUILT_COMPANY_ID=your_company_id
DEALERBUILT_STORE_ID=your_store_id
DEALERBUILT_SERVICE_LOCATION_ID=your_service_location_id

# Database Configuration
POSTGRES_PASSWORD=your_secure_database_password

# Security Configuration
SECRET_KEY=your_very_secure_secret_key_here
```

### 4. Deploy the Application

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy the complete stack
./deploy.sh deploy
```

### 5. Verify Installation

```bash
# Check service status
./deploy.sh status

# Test API connectivity
curl http://localhost/api/dashboard/health

# Access the dashboard
open http://localhost
```

## Configuration Options

### Environment Variables

#### API Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DEALERBUILT_USERNAME` | DMS API username (DealerBuilt) | Yes | `demo_user` |
| `DEALERBUILT_PASSWORD` | DMS API password (DealerBuilt) | Yes | `demo_password` |
| `DEALERBUILT_SOURCE_ID` | Source identifier | Yes | `DEMO_SOURCE` |
| `DEALERBUILT_COMPANY_ID` | Company identifier | Yes | `DEMO_COMPANY` |
| `DEALERBUILT_STORE_ID` | Store identifier | Yes | `DEMO_STORE` |
| `DEALERBUILT_SERVICE_LOCATION_ID` | Service location ID | Yes | `DEMO_SERVICE_LOC` |

#### Database Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password | Yes | `dealerbuilt_secure_password` |
| `DATABASE_URL` | Database connection string | No | Auto-generated |

#### Application Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SECRET_KEY` | Flask secret key | Yes | Auto-generated |
| `FLASK_ENV` | Flask environment | No | `production` |
| `LOG_LEVEL` | Logging level | No | `INFO` |
| `CACHE_TTL` | Cache time-to-live (seconds) | No | `600` |

### SSL/HTTPS Configuration

#### Development (HTTP)
The default configuration runs on HTTP for development and testing.

#### Production (HTTPS)
For production deployment with HTTPS:

1. **Obtain SSL Certificate**:
   ```bash
   # Using Let's Encrypt (recommended)
   sudo apt install certbot
   sudo certbot certonly --standalone -d yourdomain.com
   ```

2. **Update Docker Compose**:
   ```yaml
   # Add to docker-compose.yml
   frontend:
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

3. **Configure Nginx**:
   Update `nginx.conf` with SSL configuration.

### Database Options

#### SQLite (Default)
- **Use Case**: Development and small deployments
- **Configuration**: No additional setup required
- **Data Location**: `dealerbuilt-api-service/src/database/app.db`

#### PostgreSQL (Recommended for Production)
- **Use Case**: Production deployments
- **Configuration**: Set `POSTGRES_PASSWORD` in `.env`
- **Backup**: Automated backup with `./deploy.sh backup`

### Caching Configuration

#### Redis (Recommended)
- **Performance**: Significantly improves API response times
- **Configuration**: Enabled by default in Docker Compose
- **Monitoring**: Use `docker-compose exec redis redis-cli info`

## Troubleshooting Installation

### Common Issues

#### Docker Permission Errors
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

#### Port Conflicts
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting services
sudo systemctl stop apache2  # or nginx
```

#### Memory Issues
```bash
# Check available memory
free -h

# Increase Docker memory limit in Docker Desktop settings
# Or add swap space on Linux:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### API Connection Issues
```bash
# Test API connectivity
curl -v https://cdx.dealerbuilt.com/CDXWebService.asmx

# Check firewall settings
sudo ufw status

# Verify DNS resolution
nslookup cdx.dealerbuilt.com
```

### Logs and Debugging

#### View Service Logs
```bash
# All services
./deploy.sh logs

# Specific service
./deploy.sh logs backend
./deploy.sh logs frontend

# Follow logs in real-time
docker-compose logs -f backend
```

#### Debug Mode
```bash
# Enable debug mode
export FLASK_ENV=development

# Restart services
./deploy.sh stop
./deploy.sh deploy
```

### Performance Optimization

#### Resource Allocation
```bash
# Monitor resource usage
docker stats

# Adjust service resources in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

#### Database Optimization
```bash
# PostgreSQL performance tuning
# Edit postgresql.conf:
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

## Backup and Recovery

### Automated Backups
```bash
# Create backup
./deploy.sh backup

# Schedule automated backups (crontab)
0 2 * * * /path/to/dealerbuilt-dashboard/deploy.sh backup
```

### Manual Backup
```bash
# Database backup
docker-compose exec -T postgres pg_dump -U dealerbuilt dealerbuilt > backup.sql

# Application data backup
docker cp dealerbuilt-backend:/app/data ./backup_data
```

### Recovery
```bash
# Restore database
docker-compose exec -T postgres psql -U dealerbuilt dealerbuilt < backup.sql

# Restore application data
docker cp ./backup_data dealerbuilt-backend:/app/data
```

## Upgrading

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Update and redeploy
./deploy.sh update
```

### Docker Image Updates
```bash
# Pull latest base images
docker-compose pull

# Rebuild with latest images
docker-compose build --no-cache

# Deploy updated services
./deploy.sh deploy
```

## Security Considerations

### Network Security
- **Firewall**: Configure firewall to only allow necessary ports
- **VPN**: Consider VPN access for remote users
- **SSL/TLS**: Always use HTTPS in production

### Application Security
- **Strong Passwords**: Use complex passwords for all accounts
- **Regular Updates**: Keep all components updated
- **Access Control**: Implement proper user access controls
- **Monitoring**: Monitor logs for suspicious activity

### Data Security
- **Encryption**: Enable database encryption
- **Backups**: Secure backup storage
- **Access Logs**: Monitor data access patterns
- **Compliance**: Ensure compliance with relevant regulations

## Support and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check service health and logs
2. **Monthly**: Update system packages and Docker images
3. **Quarterly**: Review and update security configurations
4. **Annually**: Full security audit and penetration testing

### Monitoring Setup
```bash
# Set up log monitoring
docker-compose logs --tail=100 -f | grep ERROR

# Monitor resource usage
watch docker stats

# Set up alerts for critical issues
# Configure monitoring tools like Prometheus/Grafana
```

### Getting Help
- **Documentation**: Check the docs/ directory
- **Logs**: Always check logs first for error messages
- **Community**: GitHub Issues for bug reports and questions
- **Professional Support**: Contact for enterprise support options

---

**Installation Complete!**

Your DealerX Enterprise Dashboard should now be running and accessible at `http://localhost`. 

For production deployment, remember to:
1. Configure HTTPS/SSL
2. Set up proper backup procedures
3. Implement monitoring and alerting
4. Review security configurations
5. Train users on the system

**Next Steps**: Review the [User Guide](USER_GUIDE.md) for detailed usage instructions.

