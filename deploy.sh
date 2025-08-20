#!/bin/bash

# DealerBuilt Enterprise Dashboard - Deployment Script
# This script automates the deployment process for the complete solution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        warning ".env file not found. Creating from template..."
        cp .env.example .env
        warning "Please edit .env file with your actual configuration before proceeding"
        echo "Press Enter to continue after editing .env file..."
        read
    fi
    success "Environment configuration found"
}

# Build and deploy the application
deploy() {
    log "Starting deployment process..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    # Build new images
    log "Building application images..."
    docker-compose build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_health
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Check backend health
    if curl -f http://localhost/api/dashboard/health > /dev/null 2>&1; then
        success "Backend service is healthy"
    else
        error "Backend service is not responding"
        return 1
    fi
    
    # Check frontend health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        success "Frontend service is healthy"
    else
        error "Frontend service is not responding"
        return 1
    fi
    
    success "All services are healthy and running"
}

# Show service status
status() {
    log "Service Status:"
    docker-compose ps
    
    echo ""
    log "Service Logs (last 20 lines):"
    docker-compose logs --tail=20
}

# Stop services
stop() {
    log "Stopping all services..."
    docker-compose down
    success "All services stopped"
}

# Update services
update() {
    log "Updating services..."
    
    # Pull latest changes (if using git)
    if [ -d .git ]; then
        log "Pulling latest changes from git..."
        git pull
    fi
    
    # Rebuild and redeploy
    deploy
}

# Backup data
backup() {
    log "Creating backup..."
    
    BACKUP_DIR="backups/$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    docker-compose exec -T postgres pg_dump -U dealerbuilt dealerbuilt > "$BACKUP_DIR/database.sql"
    
    # Backup application data
    docker cp dealerbuilt-backend:/app/data "$BACKUP_DIR/app_data"
    
    # Create archive
    tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
    rm -rf "$BACKUP_DIR"
    
    success "Backup created: $BACKUP_DIR.tar.gz"
}

# Show logs
logs() {
    SERVICE=${1:-}
    if [ -n "$SERVICE" ]; then
        docker-compose logs -f "$SERVICE"
    else
        docker-compose logs -f
    fi
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        check_docker
        check_env
        deploy
        ;;
    "status")
        status
        ;;
    "stop")
        stop
        ;;
    "update")
        update
        ;;
    "backup")
        backup
        ;;
    "logs")
        logs "${2:-}"
        ;;
    "health")
        check_health
        ;;
    *)
        echo "Usage: $0 {deploy|status|stop|update|backup|logs|health}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the complete application stack"
        echo "  status  - Show service status and recent logs"
        echo "  stop    - Stop all services"
        echo "  update  - Update and redeploy services"
        echo "  backup  - Create a backup of application data"
        echo "  logs    - Show service logs (optionally specify service name)"
        echo "  health  - Check service health"
        exit 1
        ;;
esac

