# Deployment Guide
## DealerX Enterprise Dashboard

This guide provides comprehensive instructions for deploying the DealerX Enterprise Dashboard in production environments, including SSL configuration, monitoring setup, backup procedures, and scaling guidelines.

## Table of Contents

1. [Production Deployment Checklist](#production-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [SSL/HTTPS Configuration](#sslhttps-configuration)
4. [Database Setup](#database-setup)
5. [Monitoring Setup](#monitoring-setup)
6. [Backup Procedures](#backup-procedures)
7. [Scaling Guidelines](#scaling-guidelines)
8. [Security Hardening](#security-hardening)
9. [Performance Optimization](#performance-optimization)
10. [Disaster Recovery](#disaster-recovery)
11. [Maintenance Procedures](#maintenance-procedures)
12. [Troubleshooting](#troubleshooting)

## Production Deployment Checklist

### Pre-Deployment Requirements
- [ ] Domain name registered and configured
- [ ] SSL certificate obtained (Let's Encrypt or commercial)
- [ ] Production server provisioned with adequate resources
- [ ] DMS API credentials configured
- [ ] Database backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Documentation updated

### Server Requirements
- **CPU**: 4+ cores recommended
- **Memory**: 8GB+ RAM minimum, 16GB+ recommended
- **Storage**: 50GB+ SSD storage
- **Network**: Stable internet connection with static IP
- **OS**: Ubuntu 20.04+ or CentOS 8+

### Resource Allocation
```yaml
# Recommended resource allocation
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
  
  frontend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
  
  postgres:
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '1.0'
        reservations:
          memory: 2G
          cpus: '0.5'
  
  redis:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

## Environment Configuration

### Production Environment Variables

Create a production `.env` file:

```bash
# Production Environment Configuration
# DMS API Credentials
DEALERBUILT_USERNAME=your_production_username
DEALERBUILT_PASSWORD=your_production_password
DEALERBUILT_SOURCE_ID=your_production_source_id
DEALERBUILT_COMPANY_ID=your_production_company_id
DEALERBUILT_STORE_ID=your_production_store_id
DEALERBUILT_SERVICE_LOCATION_ID=your_production_service_location_id

# Database Configuration
POSTGRES_PASSWORD=your_very_secure_production_password
DATABASE_URL=postgresql://dealerbuilt:your_very_secure_production_password@postgres:5432/dealerbuilt

# Application Configuration
SECRET_KEY=your_very_secure_production_secret_key_here
FLASK_ENV=production
LOG_LEVEL=WARNING
CACHE_TTL=600

# Security Configuration
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Performance Configuration
WORKERS=4
MAX_REQUESTS=1000
MAX_REQUESTS_JITTER=50

# Monitoring Configuration
ENABLE_HEALTH_CHECKS=true
ENABLE_METRICS=true
LOG_FORMAT=json

# Feature Flags
ENABLE_REAL_TIME_UPDATES=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ADVANCED_ANALYTICS=true
ENABLE_EXPORT_FUNCTIONALITY=true
```

### Environment Validation

```bash
#!/bin/bash
# validate_env.sh

echo "Validating production environment..."

# Check required variables
required_vars=(
    "DEALERBUILT_USERNAME"
    "DEALERBUILT_PASSWORD"
    "DEALERBUILT_SOURCE_ID"
    "DEALERBUILT_COMPANY_ID"
    "DEALERBUILT_STORE_ID"
    "DEALERBUILT_SERVICE_LOCATION_ID"
    "POSTGRES_PASSWORD"
    "SECRET_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "ERROR: $var is not set"
        exit 1
    fi
done

# Validate API credentials
echo "Testing DMS API connection..."
curl -f http://localhost/api/dashboard/test-connection > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Cannot connect to DMS API"
    exit 1
fi

echo "Environment validation passed"
```

## SSL/HTTPS Configuration

### Let's Encrypt Setup

#### Automatic SSL with Let's Encrypt

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

#### Manual SSL Certificate Setup

```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/dealerbuilt
sudo chmod 700 /etc/ssl/dealerbuilt

# Copy certificates
sudo cp your_certificate.crt /etc/ssl/dealerbuilt/
sudo cp your_private_key.key /etc/ssl/dealerbuilt/

# Set permissions
sudo chmod 600 /etc/ssl/dealerbuilt/*
sudo chown root:root /etc/ssl/dealerbuilt/*
```

#### Nginx SSL Configuration

```nginx
# /etc/nginx/sites-available/dealerbuilt
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Docker containers
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## Database Setup

### PostgreSQL Production Configuration

#### Database Initialization

```bash
# Create production database
docker-compose exec postgres psql -U dealerbuilt -c "
CREATE DATABASE dealerbuilt_prod;
GRANT ALL PRIVILEGES ON DATABASE dealerbuilt_prod TO dealerbuilt;
"

# Run database migrations
docker-compose exec backend python -c "
from src.models.user import db
from src.main import app
with app.app_context():
    db.create_all()
"
```

#### PostgreSQL Optimization

```sql
-- postgresql.conf optimizations
-- Memory settings
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 4MB

-- Connection settings
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'

-- Logging
log_statement = 'all'
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on

-- Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Database Backup Strategy

```bash
#!/bin/bash
# backup_database.sh

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="dealerbuilt_backup_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose exec -T postgres pg_dump -U dealerbuilt dealerbuilt > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: $BACKUP_FILE.gz"
```

## Monitoring Setup

### Health Monitoring

#### Health Check Endpoints

```python
# health_monitoring.py
import requests
import time
import smtplib
from email.mime.text import MIMEText

def check_service_health():
    services = {
        'frontend': 'http://localhost/health',
        'backend': 'http://localhost/api/dashboard/health',
        'database': 'http://localhost/api/dashboard/test-connection'
    }
    
    results = {}
    for service, url in services.items():
        try:
            response = requests.get(url, timeout=10)
            results[service] = response.status_code == 200
        except Exception as e:
            results[service] = False
            print(f"Error checking {service}: {e}")
    
    return results

def send_alert(message):
    # Configure email alerting
    sender = 'alerts@yourdomain.com'
    recipients = ['admin@yourdomain.com']
    
    msg = MIMEText(message)
    msg['Subject'] = 'DealerBuilt Dashboard Alert'
    msg['From'] = sender
    msg['To'] = ', '.join(recipients)
    
    # Send email (configure SMTP settings)
    # smtp_server.send_message(msg)
```

#### Prometheus Monitoring

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'dealerbuilt-dashboard'
    static_configs:
      - targets: ['localhost:9090']
    
  - job_name: 'dealerbuilt-api'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
```

#### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "DealerBuilt Dashboard Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "{{datname}}"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "container_memory_usage_bytes",
            "legendFormat": "{{name}}"
          }
        ]
      }
    ]
  }
}
```

## Backup Procedures

### Automated Backup System

#### Backup Script

```bash
#!/bin/bash
# automated_backup.sh

# Configuration
BACKUP_ROOT="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

# Database backup
echo "Backing up database..."
docker-compose exec -T postgres pg_dump -U dealerbuilt dealerbuilt > "$BACKUP_DIR/database.sql"
gzip "$BACKUP_DIR/database.sql"

# Application data backup
echo "Backing up application data..."
docker cp dealerbuilt-backend:/app/data "$BACKUP_DIR/app_data"

# Configuration backup
echo "Backing up configuration..."
cp .env "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/"

# Create archive
cd $BACKUP_ROOT
tar -czf "dealerbuilt_backup_$DATE.tar.gz" "$DATE"
rm -rf "$DATE"

# Upload to cloud storage (example with AWS S3)
# aws s3 cp "dealerbuilt_backup_$DATE.tar.gz" s3://your-backup-bucket/

echo "Backup completed: dealerbuilt_backup_$DATE.tar.gz"

# Cleanup old backups (keep 30 days)
find $BACKUP_ROOT -name "dealerbuilt_backup_*.tar.gz" -mtime +30 -delete
```

#### Backup Verification

```bash
#!/bin/bash
# verify_backup.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Extract backup
tar -xzf "$BACKUP_FILE"
BACKUP_DIR=$(basename "$BACKUP_FILE" .tar.gz)

# Verify database backup
if [ -f "$BACKUP_DIR/database.sql.gz" ]; then
    gunzip -t "$BACKUP_DIR/database.sql.gz"
    if [ $? -eq 0 ]; then
        echo "Database backup verification: PASSED"
    else
        echo "Database backup verification: FAILED"
        exit 1
    fi
fi

# Verify application data
if [ -d "$BACKUP_DIR/app_data" ]; then
    echo "Application data verification: PASSED"
else
    echo "Application data verification: FAILED"
    exit 1
fi

# Cleanup
rm -rf "$BACKUP_DIR"

echo "Backup verification completed successfully"
```

## Scaling Guidelines

### Horizontal Scaling

#### Load Balancer Configuration

```nginx
# nginx load balancer configuration
upstream dealerbuilt_backend {
    least_conn;
    server backend1:5000 max_fails=3 fail_timeout=30s;
    server backend2:5000 max_fails=3 fail_timeout=30s;
    server backend3:5000 max_fails=3 fail_timeout=30s;
}

upstream dealerbuilt_frontend {
    least_conn;
    server frontend1:80 max_fails=3 fail_timeout=30s;
    server frontend2:80 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    location /api/ {
        proxy_pass http://dealerbuilt_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://dealerbuilt_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Docker Compose Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale frontend services
docker-compose up -d --scale frontend=2

# Check service status
docker-compose ps
```

### Database Scaling

#### Read Replicas

```yaml
# docker-compose.prod.yml
services:
  postgres-master:
    image: postgres:15
    environment:
      POSTGRES_DB: dealerbuilt
      POSTGRES_USER: dealerbuilt
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_master_data:/var/lib/postgresql/data
    command: postgres -c wal_level=replica -c max_wal_senders=3

  postgres-replica:
    image: postgres:15
    environment:
      POSTGRES_DB: dealerbuilt
      POSTGRES_USER: dealerbuilt
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_replica_data:/var/lib/postgresql/data
    command: postgres -c hot_standby=on
    depends_on:
      - postgres-master
```

#### Connection Pooling

```python
# database_pooling.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Master database for writes
master_engine = create_engine(
    'postgresql://user:pass@master:5432/db',
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

# Replica database for reads
replica_engine = create_engine(
    'postgresql://user:pass@replica:5432/db',
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True
)
```

## Security Hardening

### Security Configuration

#### Docker Security

```yaml
# docker-compose.secure.yml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
    user: "1000:1000"
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID

  postgres:
    security_opt:
      - no-new-privileges:true
    read_only: false
    user: "999:999"
    cap_drop:
      - ALL
```

#### Network Security

```bash
# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Configure Docker network
docker network create --driver bridge --subnet=172.20.0.0/16 dealerbuilt_network
```

#### Application Security

```python
# security_config.py
from flask import Flask
from flask_talisman import Talisman

app = Flask(__name__)

# Security headers
Talisman(app,
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data: https:",
        'font-src': "'self'",
    },
    force_https=True,
    strict_transport_security=True,
    session_cookie_secure=True,
    session_cookie_httponly=True
)
```

## Performance Optimization

### Caching Strategy

#### Redis Configuration

```yaml
# redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

#### Application Caching

```python
# caching.py
import redis
import json
from functools import wraps

redis_client = redis.Redis(
    host='redis',
    port=6379,
    db=0,
    decode_responses=True
)

def cache_result(ttl=300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            
            return result
        return wrapper
    return decorator
```

### Database Optimization

#### Query Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_deals_date ON deals(deal_date);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_inventory_status ON inventory(status);

-- Analyze table statistics
ANALYZE deals;
ANALYZE customers;
ANALYZE inventory;
```

#### Connection Pooling

```python
# database_pool.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)
```

## Disaster Recovery

### Recovery Procedures

#### Database Recovery

```bash
#!/bin/bash
# database_recovery.sh

BACKUP_FILE=$1
DATABASE_NAME="dealerbuilt"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting database recovery..."

# Stop application
docker-compose stop backend

# Drop existing database
docker-compose exec postgres psql -U dealerbuilt -c "DROP DATABASE IF EXISTS $DATABASE_NAME;"

# Create new database
docker-compose exec postgres psql -U dealerbuilt -c "CREATE DATABASE $DATABASE_NAME;"

# Restore from backup
gunzip -c "$BACKUP_FILE" | docker-compose exec -T postgres psql -U dealerbuilt -d $DATABASE_NAME

# Start application
docker-compose start backend

echo "Database recovery completed"
```

#### Full System Recovery

```bash
#!/bin/bash
# system_recovery.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting full system recovery..."

# Stop all services
docker-compose down

# Extract backup
tar -xzf "$BACKUP_FILE"
BACKUP_DIR=$(basename "$BACKUP_FILE" .tar.gz)

# Restore configuration
cp "$BACKUP_DIR/.env" .
cp "$BACKUP_DIR/docker-compose.yml" .

# Restore application data
docker run --rm -v dealerbuilt_app_data:/data -v $(pwd)/$BACKUP_DIR/app_data:/backup alpine sh -c "cp -r /backup/* /data/"

# Start services
docker-compose up -d

# Restore database
gunzip -c "$BACKUP_DIR/database.sql.gz" | docker-compose exec -T postgres psql -U dealerbuilt -d dealerbuilt

echo "Full system recovery completed"
```

## Maintenance Procedures

### Regular Maintenance

#### Daily Tasks

```bash
#!/bin/bash
# daily_maintenance.sh

echo "Running daily maintenance tasks..."

# Check service health
./deploy.sh health

# Check disk usage
df -h

# Check log files
docker-compose logs --tail=100 | grep ERROR

# Backup database
./deploy.sh backup

echo "Daily maintenance completed"
```

#### Weekly Tasks

```bash
#!/bin/bash
# weekly_maintenance.sh

echo "Running weekly maintenance tasks..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker images
docker image prune -f

# Analyze database performance
docker-compose exec postgres psql -U dealerbuilt -c "VACUUM ANALYZE;"

# Check SSL certificate expiration
certbot certificates

echo "Weekly maintenance completed"
```

#### Monthly Tasks

```bash
#!/bin/bash
# monthly_maintenance.sh

echo "Running monthly maintenance tasks..."

# Full system backup
./deploy.sh backup

# Security audit
docker-compose exec backend python -m bandit -r src/

# Performance analysis
docker stats --no-stream

# Update dependencies
cd dealerbuilt-dashboard && npm audit fix
cd ../dealerbuilt-api-service && pip-review --auto

echo "Monthly maintenance completed"
```

## Troubleshooting

### Common Production Issues

#### High Memory Usage

```bash
# Check memory usage
free -h
docker stats --no-stream

# Identify memory leaks
docker-compose logs backend | grep "Memory"

# Restart services if needed
docker-compose restart backend
```

#### Database Performance Issues

```bash
# Check slow queries
docker-compose exec postgres psql -U dealerbuilt -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
"

# Check connection count
docker-compose exec postgres psql -U dealerbuilt -c "
SELECT count(*) FROM pg_stat_activity;
"
```

#### SSL Certificate Issues

```bash
# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"

# Renew certificate
sudo certbot renew

# Test SSL configuration
curl -I https://yourdomain.com
```

### Emergency Procedures

#### Service Outage

```bash
#!/bin/bash
# emergency_restart.sh

echo "Emergency service restart..."

# Stop all services
docker-compose down

# Clear cache
docker volume rm dealerbuilt_redis_data

# Restart services
docker-compose up -d

# Wait for services to be healthy
sleep 30

# Check health
./deploy.sh health

echo "Emergency restart completed"
```

#### Data Corruption

```bash
#!/bin/bash
# emergency_recovery.sh

echo "Emergency data recovery..."

# Stop services
docker-compose stop

# Restore from latest backup
LATEST_BACKUP=$(ls -t /backups/dealerbuilt_backup_*.tar.gz | head -1)
./system_recovery.sh "$LATEST_BACKUP"

echo "Emergency recovery completed"
```

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: August 2025  
**Maintained by**: DevOps Team
