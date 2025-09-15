#!/bin/bash

# Deployment script for Pohřební věnce e-commerce platform
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="pohrebni-vence"
VERCEL_ORG_ID=${VERCEL_ORG_ID:-""}
VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID:-""}

echo -e "${BLUE}🚀 Starting deployment for ${PROJECT_NAME}${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found, installing..."
        npm install -g vercel
    fi

    print_status "Prerequisites check completed"
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm ci
    print_status "Dependencies installed"
}

# Run quality checks
run_quality_checks() {
    echo -e "${BLUE}🔍 Running quality checks...${NC}"

    # Type checking
    echo "Running TypeScript type check..."
    npm run type-check

    # Linting
    echo "Running linter..."
    npm run lint

    # Unit tests
    echo "Running unit tests..."
    npm run test

    print_status "Quality checks passed"
}

# Build application
build_application() {
    echo -e "${BLUE}🏗️  Building application...${NC}"
    npm run build
    print_status "Application built successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

    # Check if this is production deployment
    if [[ "${1}" == "production" ]]; then
        echo "Deploying to production..."
        vercel --prod --yes
    else
        echo "Deploying to preview..."
        vercel --yes
    fi

    print_status "Deployment completed"
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}🗄️  Running database migrations...${NC}"

    if [[ -f "scripts/migrate.js" ]]; then
        node scripts/migrate.js
        print_status "Database migrations completed"
    else
        print_warning "No migration script found, skipping..."
    fi
}

# Seed production data
seed_production_data() {
    echo -e "${BLUE}🌱 Seeding production data...${NC}"

    if [[ -f "scripts/seed-production.js" ]] && [[ "${1}" == "production" ]]; then
        node scripts/seed-production.js
        print_status "Production data seeded"
    else
        print_warning "Skipping production data seeding..."
    fi
}

# Verify deployment
verify_deployment() {
    echo -e "${BLUE}✅ Verifying deployment...${NC}"

    # Get deployment URL from Vercel
    DEPLOYMENT_URL=$(vercel ls --scope=${VERCEL_ORG_ID} | grep ${PROJECT_NAME} | head -1 | awk '{print $2}')

    if [[ -n "${DEPLOYMENT_URL}" ]]; then
        echo "Testing deployment at: ${DEPLOYMENT_URL}"

        # Test health endpoint
        if curl -f "${DEPLOYMENT_URL}/api/health" > /dev/null 2>&1; then
            print_status "Health check passed"
        else
            print_error "Health check failed"
            exit 1
        fi

        # Test main page
        if curl -f "${DEPLOYMENT_URL}" > /dev/null 2>&1; then
            print_status "Main page accessible"
        else
            print_error "Main page not accessible"
            exit 1
        fi

        print_status "Deployment verification completed"
        echo -e "${GREEN}🎉 Deployment successful! URL: ${DEPLOYMENT_URL}${NC}"
    else
        print_error "Could not determine deployment URL"
        exit 1
    fi
}

# Main deployment function
main() {
    local environment=${1:-"preview"}

    echo -e "${BLUE}🎯 Deploying to: ${environment}${NC}"

    check_prerequisites
    install_dependencies
    run_quality_checks
    build_application
    deploy_to_vercel "${environment}"
    run_migrations
    seed_production_data "${environment}"
    verify_deployment

    echo -e "${GREEN}🎉 Deployment process completed successfully!${NC}"
}

# Handle script arguments
case "${1}" in
    "production"|"prod")
        main "production"
        ;;
    "preview"|"staging"|"")
        main "preview"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [production|preview|help]"
        echo ""
        echo "Commands:"
        echo "  production  Deploy to production environment"
        echo "  preview     Deploy to preview environment (default)"
        echo "  help        Show this help message"
        ;;
    *)
        print_error "Unknown command: ${1}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
