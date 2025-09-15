# Deployment Guide

This document provides comprehensive instructions for deploying the Pohřební věnce e-commerce platform to production.

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Vercel CLI installed (`npm install -g vercel`)
- Access to Supabase project
- Stripe and GoPay accounts configured
- Redis instance (Upstash recommended)

## Environment Configuration

### Required Environment Variables

Copy `.env.production.example` and configure the following variables:

#### Application Settings

```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=/api
NODE_ENV=production
```

#### Database (Supabase)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

#### Authentication

```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_production_secret_key
```

#### Payment Providers

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# GoPay
GOPAY_CLIENT_ID=your_production_gopay_client_id
GOPAY_CLIENT_SECRET=your_production_gopay_client_secret
```

#### Redis Cache

```bash
REDIS_URL=your_production_redis_url
REDIS_TOKEN=your_production_redis_token
```

#### Email Service

```bash
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

#### Monitoring & Analytics

```bash
NEXT_PUBLIC_GA_ID=your_google_analytics_id
SENTRY_DSN=your_sentry_dsn
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

1. **Setup GitHub Repository**

   ```bash
   git remote add origin https://github.com/your-username/pohrebni-vence.git
   git push -u origin main
   ```

2. **Configure GitHub Secrets**
   Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - All environment variables from above

3. **Deploy**
   Push to main branch to trigger automatic deployment:

   ```bash
   git push origin main
   ```

### Method 2: Manual Deployment

1. **Install Dependencies**

   ```bash
   npm ci
   ```

2. **Run Quality Checks**

   ```bash
   npm run test:all
   ```

3. **Deploy to Vercel**

   ```bash
   npm run deploy:production
   ```

### Method 3: Vercel CLI Direct

1. **Login to Vercel**

   ```bash
   vercel login
   ```

2. **Link Project**

   ```bash
   vercel link
   ```

3. **Set Environment Variables**

   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # ... add all other variables
   ```

4. **Deploy**

   ```bash
   vercel --prod
   ```

## Database Setup

### 1. Run Migrations

```bash
npm run db:migrate
```

### 2. Seed Production Data

```bash
npm run db:seed:production
```

### 3. Configure Row Level Security

The seeding script automatically configures RLS policies, but verify in Supabase dashboard.

## Post-Deployment Checklist

### 1. Verify Health Check

```bash
curl https://your-domain.com/api/health
```

### 2. Test Core Functionality

- [ ] Homepage loads correctly
- [ ] Product catalog displays
- [ ] User registration/login works
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Payment processing works
- [ ] Admin dashboard accessible

### 3. Configure Domain

1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. Enable SSL certificate

### 4. Setup Monitoring

1. Configure Sentry for error tracking
2. Setup Google Analytics
3. Configure uptime monitoring
4. Setup performance monitoring

### 5. Configure Webhooks

1. Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
2. GoPay webhook endpoint: `https://your-domain.com/api/webhooks/gopay`

## Performance Optimization

### 1. Enable Caching

- Redis cache is automatically configured
- Vercel Edge Cache is enabled
- Static assets are optimized

### 2. Image Optimization

- Next.js Image component is configured
- Supabase Storage integration enabled
- WebP/AVIF formats supported

### 3. Bundle Analysis

```bash
npm run analyze
```

## Security Configuration

### 1. Security Headers

Security headers are configured in `next.config.ts`:

- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options

### 2. Rate Limiting

Rate limiting is configured for API routes using Upstash Redis.

### 3. CSRF Protection

Built-in Next.js CSRF protection is enabled.

## Monitoring & Maintenance

### 1. Health Monitoring

- Health check endpoint: `/api/health`
- Database connectivity check
- Redis connectivity check
- Environment validation

### 2. Error Tracking

- Sentry integration for error tracking
- Structured logging for debugging
- Performance monitoring

### 3. Backup Strategy

- Supabase automatic backups
- Regular database exports
- Code repository backups

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify TypeScript compilation
   - Check dependency versions

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Validate migration status

3. **Payment Issues**
   - Verify Stripe/GoPay credentials
   - Check webhook configurations
   - Validate SSL certificates

4. **Performance Issues**
   - Check Redis connectivity
   - Verify caching configuration
   - Monitor Core Web Vitals

### Support Contacts

- Technical Issues: [technical-support@example.com]
- Deployment Issues: [deployment@example.com]
- Emergency: [emergency@example.com]

## Rollback Procedure

1. **Identify Last Working Deployment**

   ```bash
   vercel ls
   ```

2. **Promote Previous Deployment**

   ```bash
   vercel promote [deployment-url] --scope=[team-id]
   ```

3. **Verify Rollback**

   ```bash
   curl https://your-domain.com/api/health
   ```

## Scaling Considerations

### Database Scaling

- Monitor Supabase usage
- Consider read replicas for high traffic
- Implement connection pooling

### Application Scaling

- Vercel automatically scales
- Monitor function execution times
- Consider edge functions for global performance

### Cache Scaling

- Monitor Redis usage
- Consider Redis clustering
- Implement cache warming strategies
