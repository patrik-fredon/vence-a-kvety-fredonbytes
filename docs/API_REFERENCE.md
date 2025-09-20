# API Reference Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Pohřební věnce e-commerce platform. The API follows RESTful conventions and returns JSON responses.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

### Public Endpoints

Most read operations are publicly accessible and don't require authentication.

### Authenticated Endpoints

User-specific operations require authentication via NextAuth.js session cookies.

### Admin Endpoints

Admin operations require authentication and admin role verification.

## Response Format

### Success Response

```json
{
  "data": { /* response data */ },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* additional error details */ },
  "success": false,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Products API

### List Products

Get a paginated list of products with optional filtering.

**Endpoint**: `GET /api/products`

**Query Parameters**:

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 12, max: 50)
- `category` (string, optional): Filter by category slug
- `featured` (boolean, optional): Filter featured products
- `search` (string, optional): Search in product names and descriptions
- `sort` (string, optional): Sort order (`price_asc`, `price_desc`, `name_asc`, `name_desc`, `created_desc`)
- `locale` (string, optional): Language for localized content (`cs`, `en`)

**Example Request**:

```bash
GET /api/products?page=1&limit=12&category=wreaths&featured=true&locale=cs
```

**Example Response**:

```json
{
  "data": {
    "products": [
      {
        "id": "uuid",
        "name_cs": "Pohřební věnec růže",
        "name_en": "Funeral wreath roses",
        "description_cs": "Elegantní pohřební věnec z červených růží",
        "description_en": "Elegant funeral wreath with red roses",
        "slug": "funeral-wreath-roses",
        "base_price": 1500.00,
        "category_id": "uuid",
        "images": [
          {
            "url": "/images/wreath-roses-001.jpg",
            "alt": "Pohřební věnec růže",
            "width": 800,
            "height": 600
          }
        ],
        "customization_options": [
          {
            "type": "size",
            "name_cs": "Velikost",
            "name_en": "Size",
            "options": [
              {
                "value": "small",
                "name_cs": "Malý (40cm)",
                "name_en": "Small (40cm)",
                "price_modifier": 0
              },
              {
                "value": "medium",
                "name_cs": "Střední (60cm)",
                "name_en": "Medium (60cm)",
                "price_modifier": 500
              }
            ]
          }
        ],
        "availability": {
          "in_stock": true,
          "stock_level": "high",
          "estimated_delivery": "2024-01-02"
        },
        "active": true,
        "featured": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "pages": 4,
      "has_next": true,
      "has_prev": false
    }
  },
  "success": true
}
```

### Get Product by Slug

Get detailed information about a specific product.

**Endpoint**: `GET /api/products/[slug]`

**Path Parameters**:

- `slug` (string): Product slug

**Query Parameters**:

- `locale` (string, optional): Language for localized content

**Example Request**:

```bash
GET /api/products/funeral-wreath-roses?locale=cs
```

**Example Response**:

```json
{
  "data": {
    "product": {
      "id": "uuid",
      "name_cs": "Pohřební věnec růže",
      "name_en": "Funeral wreath roses",
      "description_cs": "Elegantní pohřební věnec z červených růží...",
      "description_en": "Elegant funeral wreath with red roses...",
      "slug": "funeral-wreath-roses",
      "base_price": 1500.00,
      "category": {
        "id": "uuid",
        "name_cs": "Věnce",
        "name_en": "Wreaths",
        "slug": "wreaths"
      },
      "images": [...],
      "customization_options": [...],
      "availability": {...},
      "seo_metadata": {
        "title_cs": "Pohřební věnec růže - Ketingmar",
        "title_en": "Funeral wreath roses - Ketingmar",
        "description_cs": "Elegantní pohřební věnec...",
        "description_en": "Elegant funeral wreath...",
        "keywords": ["pohřební věnec", "růže", "funeral", "wreath"]
      }
    }
  },
  "success": true
}
```

### Get Random Products

Get random products for homepage display.

**Endpoint**: `GET /api/products/random`

**Query Parameters**:

- `count` (number, optional): Number of products to return (default: 3, max: 10)
- `locale` (string, optional): Language for localized content

**Example Request**:

```bash
GET /api/products/random?count=3&locale=cs
```

## Categories API

### List Categories

Get all product categories.

**Endpoint**: `GET /api/categories`

**Query Parameters**:

- `locale` (string, optional): Language for localized content
- `include_products` (boolean, optional): Include product count for each category

**Example Response**:

```json
{
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name_cs": "Věnce",
        "name_en": "Wreaths",
        "slug": "wreaths",
        "description_cs": "Tradiční pohřební věnce",
        "description_en": "Traditional funeral wreaths",
        "image_url": "/images/category-wreaths.jpg",
        "parent_id": null,
        "sort_order": 1,
        "product_count": 15,
        "active": true
      }
    ]
  },
  "success": true
}
```

### Get Category by Slug

Get category details with products.

**Endpoint**: `GET /api/categories/[slug]`

**Path Parameters**:

- `slug` (string): Category slug

**Query Parameters**:

- `page` (number, optional): Page number for products
- `limit` (number, optional): Products per page
- `locale` (string, optional): Language for localized content

## Cart API

### Get Cart

Get current cart contents.

**Endpoint**: `GET /api/cart`

**Authentication**: Optional (uses session for authenticated users, cookies for guests)

**Example Response**:

```json
{
  "data": {
    "cart": {
      "id": "uuid",
      "items": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "product": {
            "id": "uuid",
            "name_cs": "Pohřební věnec růže",
            "name_en": "Funeral wreath roses",
            "slug": "funeral-wreath-roses",
            "base_price": 1500.00,
            "images": [...]
          },
          "quantity": 1,
          "customizations": [
            {
              "type": "size",
              "value": "medium",
              "name_cs": "Střední (60cm)",
              "name_en": "Medium (60cm)",
              "price_modifier": 500
            },
            {
              "type": "ribbon",
              "value": "gold",
              "name_cs": "Zlatá stuha",
              "name_en": "Gold ribbon",
              "price_modifier": 100
            }
          ],
          "unit_price": 2100.00,
          "total_price": 2100.00,
          "created_at": "2024-01-01T00:00:00.000Z"
        }
      ],
      "subtotal": 2100.00,
      "delivery_cost": 200.00,
      "total": 2300.00,
      "item_count": 1,
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "success": true
}
```

### Add Item to Cart

Add a product to the cart with optional customizations.

**Endpoint**: `POST /api/cart/items`

**Authentication**: Optional

**Request Body**:

```json
{
  "product_id": "uuid",
  "quantity": 1,
  "customizations": [
    {
      "type": "size",
      "value": "medium"
    },
    {
      "type": "ribbon",
      "value": "gold"
    },
    {
      "type": "message",
      "value": "V lásce a úctě"
    }
  ]
}
```

**Example Response**:

```json
{
  "data": {
    "item": {
      "id": "uuid",
      "product_id": "uuid",
      "quantity": 1,
      "customizations": [...],
      "unit_price": 2100.00,
      "total_price": 2100.00
    },
    "cart_summary": {
      "item_count": 2,
      "subtotal": 3600.00,
      "total": 3800.00
    }
  },
  "success": true
}
```

### Update Cart Item

Update quantity or customizations of a cart item.

**Endpoint**: `PUT /api/cart/items/[id]`

**Authentication**: Optional

**Path Parameters**:

- `id` (string): Cart item ID

**Request Body**:

```json
{
  "quantity": 2,
  "customizations": [...]
}
```

### Remove Cart Item

Remove an item from the cart.

**Endpoint**: `DELETE /api/cart/items/[id]`

**Authentication**: Optional

**Path Parameters**:

- `id` (string): Cart item ID

### Merge Cart

Merge guest cart with user cart after login.

**Endpoint**: `POST /api/cart/merge`

**Authentication**: Required

**Request Body**:

```json
{
  "guest_session_id": "session_uuid"
}
```

## Orders API

### Create Order

Create a new order from cart contents.

**Endpoint**: `POST /api/orders`

**Authentication**: Optional (guest checkout supported)

**Request Body**:

```json
{
  "customer_info": {
    "first_name": "Jan",
    "last_name": "Novák",
    "email": "jan@example.com",
    "phone": "+420123456789"
  },
  "delivery_info": {
    "type": "standard",
    "address": {
      "street": "Hlavní 123",
      "city": "Praha",
      "postal_code": "11000",
      "country": "CZ"
    },
    "date": "2024-01-02",
    "time_slot": "morning",
    "instructions": "Zazvonit u vrátnice"
  },
  "payment_info": {
    "method": "stripe",
    "currency": "CZK"
  },
  "notes": "Prosím o diskrétní dodání"
}
```

**Example Response**:

```json
{
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2024-001",
      "status": "pending",
      "customer_info": {...},
      "delivery_info": {...},
      "payment_info": {...},
      "items": [...],
      "subtotal": 2100.00,
      "delivery_cost": 200.00,
      "total_amount": 2300.00,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "payment_intent": {
      "id": "pi_xxx",
      "client_secret": "pi_xxx_secret_xxx",
      "status": "requires_payment_method"
    }
  },
  "success": true
}
```

### Get Order

Get order details (authenticated users only).

**Endpoint**: `GET /api/orders/[id]`

**Authentication**: Required

**Path Parameters**:

- `id` (string): Order ID

## Payments API

### Initialize Payment

Initialize payment session for an order.

**Endpoint**: `POST /api/payments/initialize`

**Authentication**: Optional

**Request Body**:

```json
{
  "order_id": "uuid",
  "payment_method": "stripe",
  "return_url": "https://example.com/checkout/success",
  "cancel_url": "https://example.com/checkout/cancel"
}
```

### Get Payment Status

Check payment status.

**Endpoint**: `GET /api/payments/status`

**Query Parameters**:

- `payment_intent_id` (string): Payment intent ID
- `order_id` (string): Order ID

### Stripe Webhook

Handle Stripe payment webhooks.

**Endpoint**: `POST /api/payments/webhook/stripe`

**Authentication**: Webhook signature verification

### GoPay Webhook

Handle GoPay payment webhooks.

**Endpoint**: `POST /api/payments/webhook/gopay`

**Authentication**: Webhook signature verification

## Delivery API

### Calculate Delivery Cost

Calculate delivery cost and estimated time.

**Endpoint**: `POST /api/delivery/estimate`

**Request Body**:

```json
{
  "delivery_address": {
    "street": "Hlavní 123",
    "city": "Praha",
    "postal_code": "11000",
    "country": "CZ"
  },
  "delivery_type": "standard",
  "urgency": "normal",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 1,
      "customizations": [...]
    }
  ]
}
```

**Example Response**:

```json
{
  "data": {
    "delivery_cost": 200.00,
    "estimated_delivery": "2024-01-02",
    "available_time_slots": [
      {
        "id": "morning",
        "name_cs": "Dopoledne (8:00-12:00)",
        "name_en": "Morning (8:00-12:00)",
        "available": true
      },
      {
        "id": "afternoon",
        "name_cs": "Odpoledne (12:00-18:00)",
        "name_en": "Afternoon (12:00-18:00)",
        "available": true
      }
    ],
    "express_options": [
      {
        "type": "same_day",
        "name_cs": "Tentýž den",
        "name_en": "Same day",
        "additional_cost": 500.00,
        "available": true,
        "cutoff_time": "14:00"
      }
    ]
  },
  "success": true
}
```

### Get Delivery Calendar

Get available delivery dates and time slots.

**Endpoint**: `GET /api/delivery/calendar`

**Query Parameters**:

- `start_date` (string): Start date (ISO format)
- `end_date` (string): End date (ISO format)
- `postal_code` (string): Delivery postal code

## Contact API

### Submit Contact Form

Submit a contact form inquiry.

**Endpoint**: `POST /api/contact`

**Request Body**:

```json
{
  "name": "Jan Novák",
  "email": "jan@example.com",
  "phone": "+420123456789",
  "subject": "Dotaz na produkty",
  "message": "Chtěl bych se zeptat na možnosti přizpůsobení věnců.",
  "preferred_contact": "email",
  "gdpr_consent": true
}
```

**Example Response**:

```json
{
  "data": {
    "submission_id": "uuid",
    "message": "Váš dotaz byl úspěšně odeslán. Odpovíme vám do 24 hodin."
  },
  "success": true
}
```

## GDPR API

### Update Consent

Update user's GDPR consent preferences.

**Endpoint**: `POST /api/gdpr/consent`

**Authentication**: Required

**Request Body**:

```json
{
  "marketing_emails": true,
  "analytics": false,
  "personalization": true
}
```

### Request Data Export

Request export of user's personal data.

**Endpoint**: `POST /api/gdpr/export`

**Authentication**: Required

### Request Data Deletion

Request deletion of user's personal data.

**Endpoint**: `POST /api/gdpr/delete`

**Authentication**: Required

**Request Body**:

```json
{
  "confirmation": "DELETE_MY_DATA",
  "reason": "No longer need the service"
}
```

## Admin API

All admin endpoints require authentication and admin role.

### Dashboard Statistics

Get dashboard overview statistics.

**Endpoint**: `GET /api/admin/dashboard/stats`

**Authentication**: Admin required

**Example Response**:

```json
{
  "data": {
    "orders": {
      "total": 1250,
      "pending": 15,
      "processing": 8,
      "completed": 1200,
      "revenue_this_month": 125000.00
    },
    "products": {
      "total": 45,
      "active": 42,
      "out_of_stock": 3
    },
    "customers": {
      "total": 890,
      "new_this_month": 45
    }
  },
  "success": true
}
```

### Product Management

CRUD operations for products (admin only).

**Create Product**: `POST /api/admin/products`
**Update Product**: `PUT /api/admin/products/[id]`
**Delete Product**: `DELETE /api/admin/products/[id]`

### Order Management

Manage orders and update status.

**List Orders**: `GET /api/admin/orders`
**Update Order Status**: `PUT /api/admin/orders/[id]/status`

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `RATE_LIMITED` | Too many requests |
| `PAYMENT_FAILED` | Payment processing failed |
| `INVENTORY_ERROR` | Product not available |
| `DELIVERY_ERROR` | Delivery calculation failed |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 200 requests per minute per user
- **Admin endpoints**: 500 requests per minute per admin user

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (ISO format)

## Webhooks

### Stripe Webhooks

Configure the following webhook URL in your Stripe dashboard:
`https://your-domain.com/api/payments/webhook/stripe`

**Events to listen for**:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.dispute.created`

### GoPay Webhooks

Configure the following webhook URL in your GoPay dashboard:
`https://your-domain.com/api/payments/webhook/gopay`

**Events to listen for**:

- `PAYMENT_PAID`
- `PAYMENT_CANCELED`
- `PAYMENT_TIMEOUTED`

## SDK Examples

### JavaScript/TypeScript

```typescript
// API client example
class FuneralWreathsAPI {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  async getProducts(params?: ProductQueryParams) {
    const url = new URL(`${this.baseURL}/products`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async addToCart(productId: string, customizations?: Customization[]) {
    const response = await fetch(`${this.baseURL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        customizations
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.status}`);
    }

    return response.json();
  }
}

// Usage
const api = new FuneralWreathsAPI();
const products = await api.getProducts({ category: 'wreaths', locale: 'cs' });
```

This API reference provides comprehensive documentation for integrating with the Pohřební věnce e-commerce platform.
