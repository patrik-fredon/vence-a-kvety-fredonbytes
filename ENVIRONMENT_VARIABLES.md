# Environment Variables Documentation

This document describes all required and optional environment variables for the application.

## Table of Contents

- [Required Variables](#required-variables)
  - [Supabase Configuration](#supabase-configuration)
  - [Stripe Payment Configuration](#stripe-payment-configuration)
  - [Redis/Upstash Configuration](#redisupstash-configuration)
  - [NextAuth Configuration](#nextauth-configuration)
  - [SMTP Configuration](#smtp-configuration)
  - [Admin Configuration](#admin-configuration)
- [Optional Variables](#optional-variables)
- [Setup Instructions](#setup-instructions)
- [Validation](#validation)

## Required Variables

### Supabase Configuration

Database and authentication backend.

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description**: Your Supabase project URL
- **Format**: `https://[project-id].supabase.co`
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Where to find**: Supabase Dashboard → Project Settings → API

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Supabase anonymous/public key for client-side operations
- **Format**: Long JWT token starting with `eyJ`
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Project Settings → API → anon/public key

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Description**: Supabase service role key for server-side operations (bypasses RLS)
- **Format**: Long JWT token starting with `eyJ`
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Project Settings → API → service_role key
- **⚠️ Security**: Never expose this key to the client. Server-side only.

### Stripe Payment Configuration

Payment processing integration.

#### `STRIPE_SECRET_KEY`
- **Description**: Stripe secret key for server-side API calls
- **Format**: `sk_test_...` (test) or `sk_live_...` (production)
- **Example**: `sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...`
- **Where to find**: Stripe Dashboard → Developers → API keys → Secret key
- **⚠️ Security**: Never expose this key to the client. Server-side only.

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Description**: Stripe publishable key for client-side checkout
- **Format**: `pk_test_...` (test) or `pk_live_...` (production)
- **Example**: `pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...`
- **Where to find**: Stripe Dashboard → Developers → API keys → Publishable key

#### `STRIPE_WEBHOOK_SECRET`
- **Description**: Stripe webhook signing secret for verifying webhook events
- **Format**: `whsec_...`
- **Example**: `whsec_AbCdEfGhIjKlMnOpQrStUvWxYz123456789`
- **Where to find**: Stripe Dashboard → Developers → Webhooks → [Your endpoint] → Signing secret
- **Setup**: 
  1. Add webhook endpoint: `https://yourdomain.com/api/payments/webhook/stripe`
  2. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.requires_action`, `payment_intent.processing`, `payment_intent.canceled`
  3. Copy the signing secret

### Redis/Upstash Configuration

Caching and session management.

#### `UPSTASH_REDIS_REST_URL`
- **Description**: Upstash Redis REST API URL
- **Format**: `https://[region]-[id].upstash.io`
- **Example**: `https://us1-example-12345.upstash.io`
- **Where to find**: Upstash Console → Your Database → REST API → UPSTASH_REDIS_REST_URL

#### `UPSTASH_REDIS_REST_TOKEN`
- **Description**: Upstash Redis REST API authentication token
- **Format**: Long alphanumeric string
- **Example**: `AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz123456789==`
- **Where to find**: Upstash Console → Your Database → REST API → UPSTASH_REDIS_REST_TOKEN

### NextAuth Configuration

Authentication session management.

#### `NEXTAUTH_SECRET`
- **Description**: Secret key for encrypting NextAuth session tokens
- **Format**: Random string, minimum 32 characters
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **How to generate**: 
  ```bash
  openssl rand -base64 32
  ```
  or
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

#### `NEXTAUTH_URL` (Optional in production)
- **Description**: Base URL for NextAuth callbacks
- **Format**: `http://localhost:3000` (development) or `https://yourdomain.com` (production)
- **Example**: `https://pohrebni-vence.cz`
- **Note**: Automatically detected in production on Vercel

### SMTP Configuration

Email delivery via Supabase SMTP.

#### `SMTP_HOST`
- **Description**: SMTP server hostname
- **Format**: Hostname or IP address
- **Example**: `smtp.supabase.com` or your custom SMTP server
- **Where to find**: Supabase Dashboard → Project Settings → SMTP (if using Supabase SMTP)

#### `SMTP_PORT`
- **Description**: SMTP server port
- **Format**: Number (typically 587 for TLS, 465 for SSL, 25 for unencrypted)
- **Example**: `587`
- **Recommended**: Use `587` with TLS for security

#### `SMTP_USER`
- **Description**: SMTP authentication username
- **Format**: Usually an email address or username
- **Example**: `your-project@smtp.supabase.com`
- **Where to find**: Supabase Dashboard → Project Settings → SMTP

#### `SMTP_PASS`
- **Description**: SMTP authentication password
- **Format**: Password or API key
- **Example**: `your-smtp-password-here`
- **Where to find**: Supabase Dashboard → Project Settings → SMTP
- **⚠️ Security**: Keep this secret and never commit to version control

#### `SMTP_FROM_EMAIL`
- **Description**: Email address to send emails from
- **Format**: Valid email address
- **Example**: `orders@pohrebni-vence.cz`
- **Note**: Must be a verified sender address in your SMTP provider

#### `SMTP_FROM_NAME`
- **Description**: Display name for sent emails
- **Format**: Any string
- **Example**: `Pohřební věnce` or `Funeral Wreaths`
- **Note**: This appears as the sender name in email clients

### Admin Configuration

Administrative notifications.

#### `ADMIN_EMAIL`
- **Description**: Email address to receive admin notifications (new orders, etc.)
- **Format**: Valid email address
- **Example**: `admin@pohrebni-vence.cz`
- **Usage**: Receives notifications for:
  - New order confirmations
  - Payment status updates
  - System alerts

## Optional Variables

### `NEXT_PUBLIC_BASE_URL`
- **Description**: Base URL for the application (used for generating absolute URLs)
- **Format**: `http://localhost:3000` (development) or `https://yourdomain.com` (production)
- **Example**: `https://pohrebni-vence.cz`
- **Default**: Automatically detected in most environments

## Setup Instructions

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy the URL and keys to your `.env` file
4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

### 3. Configure Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Go to Developers → API keys
3. Copy the keys to your `.env` file
4. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/payments/webhook/stripe`
   - Events: `checkout.session.completed`, `payment_intent.*`
   - Copy webhook secret to `.env` file

### 4. Configure Redis

1. Create a database at [upstash.com](https://upstash.com)
2. Go to your database → REST API
3. Copy the URL and token to your `.env` file

### 5. Configure SMTP

#### Option A: Supabase SMTP (Recommended)

1. Go to Supabase Dashboard → Project Settings → SMTP
2. Enable SMTP and copy credentials to your `.env` file

#### Option B: Custom SMTP Provider

1. Use your preferred SMTP provider (Gmail, SendGrid, Mailgun, etc.)
2. Configure the SMTP variables with your provider's settings

### 6. Configure Admin Email

Set the `ADMIN_EMAIL` to the email address where you want to receive order notifications.

### 7. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in your `.env` file.

## Validation

The application automatically validates all environment variables on startup. If any required variables are missing or invalid, you'll see a clear error message indicating which variables need to be configured.

To manually validate your environment configuration:

```bash
npm run type-check
```

Or start the development server:

```bash
npm run dev
```

If validation fails, you'll see output like:

```
Missing required environment variables:
  - SMTP_HOST - SMTP server host (e.g., smtp.supabase.com)
  - SMTP_FROM_EMAIL - Email address to send from (e.g., orders@pohrebni-vence.cz)

Invalid environment variables:
  - SMTP_PORT - Invalid format or value
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate secrets regularly**, especially after team member changes
4. **Use environment-specific values** (test keys in development, live keys in production)
5. **Limit access** to production environment variables
6. **Monitor usage** of API keys and tokens
7. **Enable webhook signature verification** for all Stripe webhooks

## Troubleshooting

### SMTP Connection Issues

If emails aren't sending:

1. Verify SMTP credentials are correct
2. Check that `SMTP_PORT` is correct (usually 587)
3. Ensure `SMTP_FROM_EMAIL` is verified with your provider
4. Check firewall/network settings allow outbound SMTP connections
5. Review application logs for detailed error messages

### Stripe Webhook Issues

If webhooks aren't being received:

1. Verify `STRIPE_WEBHOOK_SECRET` matches your Stripe dashboard
2. Ensure webhook endpoint is publicly accessible
3. Check that all required events are selected in Stripe dashboard
4. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook/stripe
   ```

### Database Connection Issues

If database operations fail:

1. Verify Supabase URL and keys are correct
2. Check that database migrations have been run
3. Ensure Row Level Security (RLS) policies are configured
4. Review Supabase logs for connection errors

## Example .env File

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
STRIPE_WEBHOOK_SECRET=whsec_AbCdEfGhIjKlMnOpQrStUvWxYz123456789

# Redis/Upstash
UPSTASH_REDIS_REST_URL=https://us1-example-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz123456789==

# NextAuth
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
NEXTAUTH_URL=http://localhost:3000

# SMTP (Supabase SMTP)
SMTP_HOST=smtp.supabase.com
SMTP_PORT=587
SMTP_USER=your-project@smtp.supabase.com
SMTP_PASS=your-smtp-password-here
SMTP_FROM_EMAIL=orders@pohrebni-vence.cz
SMTP_FROM_NAME=Pohřební věnce

# Admin
ADMIN_EMAIL=admin@pohrebni-vence.cz

# Optional
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Support

For additional help:
- Review the [main README](./README.md)
- Check [Stripe Integration Guide](./docs/stripe-integration-guide.md)
- Consult [Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)
