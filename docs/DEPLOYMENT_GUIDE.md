# Deployment Guide

## Overview

This guide covers the complete deployment process for the Pohřební věnce e-commerce platform, including environment setup, configuration, and best practices for production deployment.

## Prerequisites

### Required Services

1. **Vercel Account** - For hosting and deployment
2. **Supabase Project** - For database and authentication
3. **Upstash Redis** - For caching and session storage
4. **Stripe Account** - For international payments
5. **GoPay Account** - For Czech market payments
6. **Resend Account** - For transactional emails
7. **Domain Name** - For production deployment

### Development Tools

- Node.js 18+ (recommended: 20+)
- Git
- Vercel CLI (optional but recommended)

## Environment Setup

### 1. Supabase Configuration

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Generate a service role key from the API settings

#### Database Setup

1. Run the database migrations:

```sql
-- Copy and execute the contents of src/lib/supabase/schema.sql
-- in the Supabase SQL editor
```

2. Set up Row Level Security policies:

```sql
-- Copy and execute the contents of src/lib/supabase/rls-policies.sql
```

3. Configure authentication providers in Supabase Auth settings

#### Environment Variables for Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Redis Configuration (Upstash)

#### Create Upstash Redis Database

1. Go to [upstash.com](https://upstash.com) and create a Redis database
2. Choose the region closest to your users (Europe for Czech market)
3. Copy the REST URL and token

#### Environment Variables for Redis

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 3. Payment Provider Setup

#### Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable and secret keys from the dashboard
3. Configure webhooks (see webhook section below)

```env
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### GoPay Configuration

1. Create a GoPay account for Czech payments
2. Get your credentials from the GoPay dashboard
3. Configure webhook endpoints

```env
GOPAY_GOID=your-goid
GOPAY_CLIENT_ID=your-client-id
GOPAY_CLIENT_SECRET=your-client-secret
GOPAY_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Email Service Setup (Resend)

#### Resend Configuration

1. Create account at [resend.com](https://resend.com)
2. Verify your domain for sending emails
3. Generate API key

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@your-domain.com
```

### 5. Authentication Setup

#### NextAuth Configuration

```env
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-domain.com # or http://localhost:3000 for development
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

## Vercel Deployment

### 1. Project Setup

#### Connect Repository

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Choose the Next.js framework preset
3. Configure build settings (usually auto-detected)

#### Build Configuration

Vercel should automatically detect the Next.js configuration. If needed, customize:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 2. Environment Variables

#### Production Environment Variables

Add all environment variables in the Vercel dashboard under Project Settings > Environment Variables:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Authentication
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com

# Caching
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# Payments
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOPAY_GOID=your-goid
GOPAY_CLIENT_ID=your-client-id
GOPAY_CLIENT_SECRET=your-client-secret

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@your-domain.com

# Optional: Analytics and monitoring
NEXT_PUBLIC_GA_ID=G-...
SENTRY_DSN=https://...
```

#### Environment-Specific Variables

Set different values for preview and production environments:

- **Production**: Live API keys and production URLs
- **Preview**: Test API keys and staging URLs
- **Development**: Local development configuration

### 3. Domain Configuration

#### Custom Domain Setup

1. Add your custom domain in Vercel dashboard
2. Configure DNS records as instructed by Vercel
3. Enable automatic HTTPS (handled by Vercel)

#### DNS Configuration

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

### 4. Deployment Process

#### Automatic Deployment

- **Production**: Push to `main` branch triggers production deployment
- **Preview**: Pull requests create preview deployments
- **Development**: Local development with `npm run dev`

#### Manual Deployment

Using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy preview
vercel
```

## Webhook Configuration

### Stripe Webhooks

#### Setup in Stripe Dashboard

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
4. Copy the webhook secret to your environment variables

#### Testing Webhooks

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/payments/webhook/stripe

# Test webhook
stripe trigger payment_intent.succeeded
```

### GoPay Webhooks

#### Setup in GoPay Dashboard

1. Configure webhook URL: `https://your-domain.com/api/payments/webhook/gopay`
2. Enable events:
   - `PAYMENT_PAID`
   - `PAYMENT_CANCELED`
   - `PAYMENT_TIMEOUTED`

## Database Migration

### Production Database Setup

#### Initial Migration

```bash
# Run database setup script
npm run db:migrate

# Seed with production data
npm run db:seed:production
```

#### Schema Updates

For schema changes in production:

1. Test changes in development/staging
2. Create migration scripts
3. Apply during maintenance window
4. Verify data integrity

### Backup Strategy

#### Automated Backups

Supabase provides automatic backups:

- Point-in-time recovery (7 days for free tier)
- Daily backups (retained based on plan)

#### Manual Backup

```bash
# Export database
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" > backup.sql

# Import database
psql "postgresql://postgres:[password]@[host]:5432/postgres" < backup.sql
```

## Performance Optimization

### Caching Strategy

#### Redis Caching

- Cart data: 1 hour TTL
- Product data: 5 minutes TTL
- User sessions: 24 hours TTL
- API responses: Variable TTL based on content

#### CDN Configuration

Vercel automatically provides CDN caching:

- Static assets: Long-term caching
- API responses: Short-term caching with proper headers
- Images: Optimized and cached globally

### Database Optimization

#### Indexing Strategy

```sql
-- Product search optimization
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('czech', name_cs || ' ' || description_cs));
CREATE INDEX idx_products_search_en ON products USING gin(to_tsvector('english', name_en || ' ' || description_en));

-- Performance indexes
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_cart_items_session_user ON cart_items(session_id, user_id);
```

#### Query Optimization

- Use proper indexes for frequent queries
- Implement pagination for large datasets
- Cache expensive queries in Redis
- Monitor query performance with Supabase dashboard

## Security Configuration

### HTTPS and SSL

- Vercel automatically provides SSL certificates
- Enforce HTTPS redirects
- Use secure headers

### Security Headers

Configure in `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### Rate Limiting

- API endpoints protected with Upstash Rate Limit
- Different limits for authenticated vs anonymous users
- Admin endpoints have higher limits

### CSRF Protection

- Built-in CSRF token validation
- Secure cookie configuration
- SameSite cookie attributes

## Monitoring and Logging

### Error Tracking

#### Sentry Integration (Optional)

```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### Custom Error Logging

Errors are logged to Supabase `error_logs` table:

```typescript
await supabase
  .from('error_logs')
  .insert({
    message: error.message,
    stack: error.stack,
    url: request.url,
    timestamp: new Date().toISOString()
  });
```

### Performance Monitoring

#### Core Web Vitals

Tracked automatically with Next.js:

```typescript
export function reportWebVitals(metric) {
  // Send to analytics service
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}
```

#### Custom Metrics

- API response times
- Database query performance
- Cache hit rates
- User journey completion rates

### Health Checks

#### Health Endpoint

`GET /api/health` provides system status:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "email": "healthy"
  },
  "version": "1.0.0"
}
```

#### Uptime Monitoring

Configure external monitoring services:

- Pingdom
- UptimeRobot
- StatusCake

## Maintenance and Updates

### Deployment Pipeline

#### Staging Environment

1. Create staging branch from main
2. Deploy to preview environment
3. Run full test suite
4. Manual QA testing
5. Merge to main for production deployment

#### Production Deployment

```bash
# 1. Ensure all tests pass
npm run test:all

# 2. Build and analyze bundle
npm run build
npm run analyze

# 3. Deploy to production
git push origin main
```

### Database Maintenance

#### Regular Tasks

- Monitor query performance
- Update statistics
- Clean up old sessions and logs
- Backup verification

#### Scheduled Cleanup

```sql
-- Clean up old cart items (run daily)
DELETE FROM cart_items
WHERE created_at < NOW() - INTERVAL '30 days'
AND user_id IS NULL;

-- Clean up old error logs (run weekly)
DELETE FROM error_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Security Updates

#### Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Update Node.js version
- Review and rotate API keys

#### Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS enforced
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens validated

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues

- Verify Supabase credentials
- Check connection limits
- Review RLS policies
- Monitor database logs

#### Payment Issues

- Verify webhook endpoints
- Check API key validity
- Monitor payment provider dashboards
- Review error logs

#### Performance Issues

- Check Redis connection
- Monitor database queries
- Review bundle size
- Analyze Core Web Vitals

### Debugging Tools

#### Vercel Logs

```bash
# View function logs
vercel logs

# View build logs
vercel logs --build
```

#### Database Debugging

- Use Supabase dashboard for query analysis
- Enable slow query logging
- Monitor connection pool usage

#### Redis Debugging

- Use Upstash dashboard for monitoring
- Check connection and memory usage
- Monitor cache hit rates

## Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous deployment
vercel rollback

# Or rollback to specific deployment
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# Restore from backup
pg_restore -d "postgresql://..." backup.sql

# Or use Supabase point-in-time recovery
# (Available in Supabase dashboard)
```

### Emergency Procedures

1. **Immediate**: Rollback deployment via Vercel
2. **Database**: Restore from latest backup if needed
3. **Communication**: Update status page and notify users
4. **Investigation**: Analyze logs and identify root cause
5. **Fix**: Implement fix and redeploy
6. **Post-mortem**: Document incident and improve processes

This deployment guide ensures a smooth and secure production deployment of the Pohřební věnce e-commerce platform.
