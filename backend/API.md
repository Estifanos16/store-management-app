# Store Management API

## Authentication

### POST /api/auth/register
Creates a new user and initial shop.

Request:
```json
{
  "name": "Alemu",
  "email": "owner@example.com",
  "password": "StrongPassword123!",
  "shopName": "Addis Mart",
  "address": "Bole Road",
  "phone": "+251911000000",
  "currency": "ETB"
}
```

### POST /api/auth/login
Returns access and refresh tokens.

### POST /api/auth/refresh
Exchanges a valid refresh token for new tokens.

### POST /api/auth/logout
Invalidates the current refresh token.

### GET /api/auth/me
Returns the authenticated user and memberships.

## Shops

### GET /api/shops
List shops for the current user.

### GET /api/shops/:shopId
Return a specific shop and membership role.

## Products

### GET /api/products
Returns products in the shop.

### POST /api/products
Creates a product.

### GET /api/products/:productId
Returns a product.

### PATCH /api/products/:productId
Updates a product.

## Items

### GET /api/items
Lists shop items with optional status filters.

### POST /api/items
Registers one or more physical items.

### GET /api/items/:itemId
Get an item and its history.

### PATCH /api/items/:itemId/status
Changes an item's lifecycle status, respecting business rules.

## Sales

### GET /api/sales
List sales for a shop.

### POST /api/sales
Creates a sale from scanned item IDs.

### GET /api/sales/:saleId
Returns a sale with items and seller information.

## Returns

### POST /api/returns
Marks an item as returned and records a reason.

### GET /api/returns
Lists returns in the shop.

## Expenses

### GET /api/expenses
Lists expenses for a shop.

### POST /api/expenses
Adds a new expense.

## Reports

### GET /api/reports/dashboard
Returns summary metrics for the shop.

### GET /api/reports/profit
Returns sales, costs, and profit metrics.

## Sync Queue

### GET /api/sync/operations
Lists pending synchronization operations.

### POST /api/sync/operations
Queues an offline operation for later server processing.

## Authorization model

- Owners manage shops, sellers, products, expenses, reports, and settings.
- Sellers operate within the authorized shop and can complete permitted sales.
- Every request is validated against the authenticated user's membership in the requested shop.
