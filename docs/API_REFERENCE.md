# API Reference

## Overview

This document provides comprehensive API documentation for the funeral wreath e-commerce platform. All API endpoints follow RESTful conventions and return JSON responses.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

### Authentication Methods

1. **Session-based**: Automatic via NextAuth.js cookies
2. **API Key**: For server-to-server communication (admin endpoints)

### Protected Endpoints

Protected endpoints require authentication. Include credentials in requests:

```typescript
fetch("/api/protected-endpoint", {
  method: "GET",
  credentials: "include", // Include session cookies
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    /* optional error details */
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

## Products API

### List Products

Get paginated list of products with optional filtering.

```http
GET /api/products
```

**Query Parameters:**

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| page      | number | No       | Page number (default: 1)             |
| limit     | number | No       | Items per page (default: 12)         |
| category  | string | No       | Filter by category slug              |
| search    | string | No       | Search query                         |
| minPrice  | number | No       | Minimum price filter                 |
| maxPrice  | number | No       | Maximum price filter                 |
| sortBy    | string | No       | Sort field (price, name, created_at) |
| sortOrder | string | No       | Sort order (asc, desc)               |

**Example Request:**

```typescript
const response = await fetch("/api/products?page=1&limit=12&category=wreaths");
const data = await response.json();
```

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name_cs": "Pohřební věnec s růžemi",
        "name_en": "Funeral wreath with roses",
        "slug": "funeral-wreath-roses",
        "base_price": 1500,
        "description_cs": "Elegantní věnec...",
        "description_en": "Elegant wreath...",
        "images": [
          {
            "url": "/images/product.jpg",
            "alt": "Product image",
            "isPrimary": true
          }
        ],
        "category": {
          "id": "uuid",
          "name_cs": "Věnce",
          "name_en": "Wreaths",
          "slug": "wreaths"
        },
        "active": true,
        "created_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 48,
      "totalPages": 4
    }
  }
}
```

### Get Product by Slug

Get detailed product information by slug.

```http
GET /api/products/[slug]
```

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| slug      | string | Yes      | Product slug |

**Example Request:**

```typescript
const response = await fetch("/api/products/funeral-wreath-roses");
const data = await response.json();
```

**Response:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name_cs": "Pohřební věnec s růžemi",
      "name_en": "Funeral wreath with roses",
      "slug": "funeral-wreath-roses",
      "base_price": 1500,
      "description_cs": "Detailní popis...",
      "description_en": "Detailed description...",
      "images": [...],
      "category": {...},
      "customization_options": [
        {
          "id": "uuid",
          "type": "size",
          "name_cs": "Velikost",
          "name_en": "Size",
          "options": [
            {
              "value": "small",
              "label_cs": "Malý",
              "label_en": "Small",
              "price_modifier": 0
            },
            {
              "value": "medium",
              "label_cs": "Střední",
              "label_en": "Medium",
              "price_modifier": 300
            },
            {
              "value": "large",
              "label_cs": "Velký",
              "label_en": "Large",
              "price_modifier": 600
            }
          ]
        }
      ],
      "inventory": {
        "in_stock": true,
        "quantity": 10,
        "low_stock_threshold": 5
      }
    }
  }
}
```

### Get Random Products

Get random products for homepage display.

```http
GET /api/products/random
```

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| limit     | number | No       | Number of products (default: 6) |

**Example Request:**

```typescript
const response = await fetch("/api/products/random?limit=6");
const data = await response.json();
```

## Categories API

### List Categories

Get all product categories.

```http
GET /api/categories
```

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name_cs": "Věnce",
        "name_en": "Wreaths",
        "slug": "wreaths",
        "description_cs": "Pohřební věnce...",
        "description_en": "Funeral wreaths...",
        "product_count": 24
      }
    ]
  }
}
```

### Get Category with Products

Get category details with products.

```http
GET /api/categories/[slug]
```

**Path Parameters:**

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| slug      | string | Yes      | Category slug |

**Query Parameters:**

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| page      | number | No       | Page number (default: 1)     |
| limit     | number | No       | Items per page (default: 12) |

## Cart API

### Get Cart

Get current user's cart contents.

```http
GET /api/cart
```

**Authentication:** Required (session or guest)

**Response:**

```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "session_id": "session-id",
      "items": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "quantity": 1,
          "customizations": {
            "size": "medium",
            "ribbon": "gold",
            "message": "In loving memory"
          },
          "unit_price": 1800,
          "total_price": 1800,
          "product": {
            "name_cs": "Pohřební věnec s růžemi",
            "name_en": "Funeral wreath with roses",
            "slug": "funeral-wreath-roses",
            "images": [...]
          }
        }
      ],
      "subtotal": 1800,
      "delivery_cost": 200,
      "total": 2000,
      "item_count": 1
    }
  }
}
```

### Add Item to Cart

Add product to cart with customizations.

```http
POST /api/cart/items
```

**Authentication:** Required (session or guest)

**Request Body:**

```json
{
  "product_id": "uuid",
  "quantity": 1,
  "customizations": {
    "size": "medium",
    "ribbon": "gold",
    "message": "In loving memory"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "uuid",
      "product_id": "uuid",
      "quantity": 1,
      "customizations": {...},
      "unit_price": 1800,
      "total_price": 1800
    },
    "cart": {
      "item_count": 1,
      "total": 2000
    }
  }
}
```

### Update Cart Item

Update cart item quantity or customizations.

```http
PUT /api/cart/items/[id]
```

**Authentication:** Required (session or guest)

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| id        | string | Yes      | Cart item ID |

**Request Body:**

```json
{
  "quantity": 2,
  "customizations": {
    "size": "large",
    "ribbon": "silver"
  }
}
```

### Remove Cart Item

Remove item from cart.

```http
DELETE /api/cart/items/[id]
```

**Authentication:** Required (session or guest)

**Path Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| id        | string | Yes      | Cart item ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Item removed from cart",
    "cart": {
      "item_count": 0,
      "total": 0
    }
  }
}
```

### Clear Cart Cache

Explicitly clear cart cache (useful for troubleshooting).

```http
POST /api/cart/clear-cache
```

**Authentication:** Required (session or guest)

**Response:**

```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

### Merge Guest Cart

Merge guest cart with user cart after authentication.

```http
POST /api/cart/merge
```

**Authentication:** Required (authenticated user)

**Request Body:**

```json
{
  "guest_session_id": "session-id"
}
```

## Orders API

### Create Order

Create new order from cart.

```http
POST /api/orders
```

**Authentication:** Required (session or authenticated)

**Request Body:**

```json
{
  "customer": {
    "first_name": "Jan",
    "last_name": "Novák",
    "email": "jan@example.com",
    "phone": "+420123456789"
  },
  "delivery": {
    "address": "Hlavní 123",
    "city": "Praha",
    "postal_code": "11000",
    "country": "CZ",
    "delivery_date": "2025-10-10",
    "delivery_time": "10:00-12:00",
    "urgency": "standard"
  },
  "payment_method": "stripe",
  "notes": "Optional order notes"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2025-001",
      "status": "pending",
      "total": 2000,
      "payment_status": "pending",
      "created_at": "2025-10-03T10:00:00.000Z"
    },
    "payment": {
      "client_secret": "stripe-client-secret",
      "payment_intent_id": "pi_xxx"
    }
  }
}
```

### Get Order

Get order details by ID.

```http
GET /api/orders/[id]
```

**Authentication:** Required (order owner or admin)

**Path Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Order ID    |

**Response:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2025-001",
      "status": "processing",
      "payment_status": "paid",
      "items": [...],
      "customer": {...},
      "delivery": {...},
      "subtotal": 1800,
      "delivery_cost": 200,
      "total": 2000,
      "created_at": "2025-10-03T10:00:00.000Z",
      "updated_at": "2025-10-03T10:30:00.000Z"
    }
  }
}
```

## Payments API

### Initialize Payment

Initialize payment session.

```http
POST /api/payments/initialize
```

**Authentication:** Required

**Request Body:**

```json
{
  "order_id": "uuid",
  "payment_method": "stripe",
  "return_url": "https://your-domain.com/orders/uuid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "client_secret": "stripe-client-secret",
    "payment_intent_id": "pi_xxx",
    "publishable_key": "pk_xxx"
  }
}
```

### Check Payment Status

Check payment status for order.

```http
GET /api/payments/status
```

**Query Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| order_id  | string | Yes      | Order ID    |

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "succeeded",
    "payment_method": "stripe",
    "amount": 2000,
    "currency": "czk",
    "paid_at": "2025-10-03T10:30:00.000Z"
  }
}
```

### Stripe Webhook

Webhook endpoint for Stripe payment events.

```http
POST /api/payments/webhook/stripe
```

**Headers:**

```
stripe-signature: webhook-signature
```

### GoPay Webhook

Webhook endpoint for GoPay payment events.

```http
POST /api/payments/webhook/gopay
```

## Delivery API

### Estimate Delivery Cost

Calculate delivery cost and estimated time.

```http
POST /api/delivery/estimate
```

**Request Body:**

```json
{
  "postal_code": "11000",
  "urgency": "standard",
  "delivery_date": "2025-10-10"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cost": 200,
    "estimated_delivery": "2025-10-10",
    "delivery_window": "10:00-12:00",
    "urgency_options": [
      {
        "type": "standard",
        "cost": 200,
        "delivery_date": "2025-10-10"
      },
      {
        "type": "express",
        "cost": 400,
        "delivery_date": "2025-10-04"
      }
    ]
  }
}
```

### Get Delivery Calendar

Get available delivery slots.

```http
GET /api/delivery/calendar
```

**Query Parameters:**

| Parameter   | Type   | Required | Description             |
| ----------- | ------ | -------- | ----------------------- |
| postal_code | string | Yes      | Delivery postal code    |
| start_date  | string | No       | Start date (ISO format) |
| end_date    | string | No       | End date (ISO format)   |

**Response:**

```json
{
  "success": true,
  "data": {
    "available_dates": [
      {
        "date": "2025-10-10",
        "slots": [
          {
            "time": "10:00-12:00",
            "available": true
          },
          {
            "time": "14:00-16:00",
            "available": false
          }
        ]
      }
    ]
  }
}
```

## Contact API

### Submit Contact Form

Submit contact form inquiry.

```http
POST /api/contact
```

**Request Body:**

```json
{
  "name": "Jan Novák",
  "email": "jan@example.com",
  "phone": "+420123456789",
  "subject": "Product inquiry",
  "message": "I would like to know more about...",
  "preferred_contact": "email"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Contact form submitted successfully",
    "reference_number": "CF-2025-001"
  }
}
```

## GDPR API

### Update Consent

Update user consent preferences.

```http
POST /api/gdpr/consent
```

**Authentication:** Required

**Request Body:**

```json
{
  "analytics": true,
  "marketing": false,
  "functional": true
}
```

### Request Data Export

Request user data export.

```http
POST /api/gdpr/export
```

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Data export request received",
    "estimated_completion": "2025-10-04T10:00:00.000Z"
  }
}
```

### Request Data Deletion

Request account and data deletion.

```http
POST /api/gdpr/delete
```

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Data deletion request received",
    "deletion_date": "2025-10-10T00:00:00.000Z"
  }
}
```

## Admin API

All admin endpoints require admin authentication.

### Dashboard Stats

Get dashboard statistics.

```http
GET /api/admin/dashboard/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 150,
      "pending": 5,
      "processing": 10,
      "completed": 130,
      "cancelled": 5
    },
    "revenue": {
      "today": 15000,
      "week": 75000,
      "month": 300000
    },
    "products": {
      "total": 48,
      "active": 45,
      "low_stock": 3
    },
    "customers": {
      "total": 200,
      "new_this_month": 25
    }
  }
}
```

### Product Management

#### List All Products (Admin)

```http
GET /api/admin/products
```

#### Create Product

```http
POST /api/admin/products
```

**Request Body:**

```json
{
  "name_cs": "Nový věnec",
  "name_en": "New wreath",
  "slug": "new-wreath",
  "base_price": 1500,
  "description_cs": "Popis...",
  "description_en": "Description...",
  "category_id": "uuid",
  "images": [...],
  "customization_options": [...],
  "active": true
}
```

#### Update Product

```http
PUT /api/admin/products/[id]
```

#### Delete Product

```http
DELETE /api/admin/products/[id]
```

### Order Management

#### List All Orders

```http
GET /api/admin/orders
```

**Query Parameters:**

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| status    | string | No       | Filter by status |
| page      | number | No       | Page number      |
| limit     | number | No       | Items per page   |

#### Update Order Status

```http
PUT /api/admin/orders/[id]/status
```

**Request Body:**

```json
{
  "status": "processing"
}
```

### Contact Forms

#### List Contact Forms

```http
GET /api/admin/contact-forms
```

#### Update Form Status

```http
PUT /api/admin/contact-forms/[id]/status
```

**Request Body:**

```json
{
  "status": "resolved",
  "notes": "Responded via email"
}
```

### Cache Management

#### Clear Cache

```http
POST /api/admin/cache/clear
```

**Request Body:**

```json
{
  "cache_type": "all" | "products" | "cart" | "delivery"
}
```

### Activity Log

#### Get Activity Log

```http
GET /api/admin/activity
```

**Query Parameters:**

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| page      | number | No       | Page number             |
| limit     | number | No       | Items per page          |
| type      | string | No       | Filter by activity type |

## Monitoring API

### Log Error

Log application error.

```http
POST /api/monitoring/errors
```

**Request Body:**

```json
{
  "category": "navigation" | "payment" | "performance" | "image",
  "error": "Error message",
  "context": {
    "component": "ProductCard",
    "userId": "uuid",
    "url": "/products/slug"
  }
}
```

### Get Performance Metrics

Get performance metrics.

```http
GET /api/monitoring/performance
```

**Response:**

```json
{
  "success": true,
  "data": {
    "coreWebVitals": {
      "lcp": 2100,
      "fid": 50,
      "cls": 0.05
    },
    "componentMetrics": [...],
    "imageMetrics": [...]
  }
}
```

## Health Check

### Health Status

Check API health status.

```http
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-03T10:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy"
  }
}
```

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Anonymous**: 100 requests per 15 minutes
- **Authenticated**: 1000 requests per 15 minutes
- **Admin**: 5000 requests per 15 minutes

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696329600
```

## Error Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |
| 503  | Service Unavailable   |

## Support

For API questions or issues:

1. Check this documentation
2. Review error messages and status codes
3. Check API health endpoint
4. Contact development team: dev@ketingmar.cz
