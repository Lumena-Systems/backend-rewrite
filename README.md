# E-commerce Backend - Staff Engineer Interview

Welcome! This is a hands-on technical interview for a Backend Engineer position. You'll be working with a real e-commerce backend codebase built with TypeScript, Express, Prisma, and SQLite.

## Overview

This interview focuses on practical backend engineering challenges that staff engineers face daily:
- **Reliability**: Implementing double-write protection
- **API Design**: Designing resilient APIs for large-scale data processing
- **Performance**: Identifying and fixing database connection issues
- **Post-mortems**: Preventing classes of bugs through better practices
- **Observability**: Adding comprehensive logging, metrics, and alerting

## Tech Stack

- **Backend**: Express.js + TypeScript
- **ORM**: Prisma
- **Database**: SQLite
- **API Style**: REST

## Setup Instructions

### 1. Install Dependencies

Optional, but helpful:

```bash
npm install

# Generate Prisma client
npx prisma generate
```

## Exercise Overview

The interview consists of 5 exercises. Your interviewer will guide you through them, but here's a quick overview:

### 1. Double-Write Protection

**File**: `src/services/checkoutService.ts`  
**Endpoint**: `POST /api/checkout`

Users are (occasionally) being charged twice. Find and fix the issue.

Context:
- Users are reporting they're being charged twice for the same order.
- Occurs infrequently, but enough to be a problem.
- Based on logging, there seems to be two calls to the checkout endpoint with the same data.
- This endpoint is called by the frontend (not present in repo)

### 2. CSV Upload API Design

**File**: `src/services/bulkUpload.ts`  
**Endpoint**: `POST /api/products/bulk-upload`

Design a better API for bulk product uploads that handles large files efficiently.

### 3. Database Deadlock Issue

**File**: `src/services/paymentProcessor.ts`  
**Endpoint**: `POST /api/payments/process`

Identify and fix a critical bug causing connection pool exhaustion.

There was a new server deployment that made changes to our paymentProcessor.
All requests, even those unrelated to the paymentProcessor, are hanging.
DB connection pool shows that all connections are being used.

### 4. Post-mortem Analysis

**File**: `src/services/discountService.ts`  
**Endpoint**: `POST /api/checkout/:orderId/apply-coupon`

A previous SEV caused incorrect discounts in production. How would you prevent this class of bugs in the future?

### 5. Observability

**File**: `src/services/orderFulfillment.ts`  
**Endpoint**: `POST /api/orders/:orderId/fulfill`

Add comprehensive observability to the order fulfillment pipeline:
- Structured logging
- Metrics
- Alerting for failure scenarios

## API Endpoints Reference

### Orders
- `POST /api/orders/:orderId/fulfill` - Fulfill an order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/user/:userId` - Get user's orders

### Payments
- `POST /api/payments/process` - Process payment with fraud check
- `POST /api/payments/process-simple` - Process payment without fraud check
- `GET /api/payments/:paymentId` - Get payment status

### Products
- `GET /api/products` - List all products
- `GET /api/products/:productId` - Get product details
- `POST /api/products` - Create a product
- `POST /api/products/bulk-upload` - Bulk upload via CSV
- `GET /api/products/sample-csv/:rows` - Generate sample CSV

### Checkout
- `POST /api/checkout` - Process checkout (double-write issue)
- `POST /api/checkout/:orderId/apply-coupon` - Apply discount coupon (type bug)
- `GET /api/checkout/coupons` - List active coupons
- `POST /api/checkout/coupons` - Create a coupon

### Health
- `GET /health` - Health check
- `GET /` - API info

## Tips

1. **Feel free to modify anything** - This is your codebase for the interview
2. **Pseudo-code is acceptable** - For some exercises, describing your approach is fine
3. **Ask questions** - We're happy to clarify requirements
4. **Think production-scale** - Consider what happens with 1000s of requests/second
5. **Discuss trade-offs** - There are multiple valid approaches; we want to hear your reasoning

## Project Structure

```
src/
├── index.ts                   # Express app entry point
├── routes/                    # API route handlers
│   ├── orders.ts
│   ├── payments.ts
│   ├── products.ts
│   └── checkout.ts
├── services/                  # Business logic
│   ├── checkoutService.ts     # Double-write exercise
│   ├── bulkUpload.ts          # CSV upload exercise
│   ├── paymentProcessor.ts    # Deadlock exercise
│   ├── discountService.ts     # Post-mortem exercise
│   ├── orderFulfillment.ts    # Observability exercise
│   ├── observability.ts       # Observability interface
│   └── externalValidator.ts   # Simulated external API
├── utils/
│   └── database.ts            # Prisma client
prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Seed data
```

## Questions?

Don't hesitate to ask your interviewer questions during the interview. Good luck!
