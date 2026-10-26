# Project: Store Management App

## Role: Backend Developer

Act as a senior backend developer and database architect. Build a secure, reliable REST API for a QR-based Store Management App used by general retail businesses.

This is a general-purpose store management system, not a clothing-specific application.

The system must identify every physical item individually using a unique identifier that can be encoded in a QR code. It must support inventory management, sales, returns, expenses, profit reporting, multiple shops, role-based access, and offline synchronization.

The frontend will be developed independently by another team member using React Native, Expo, and TypeScript.

Your responsibility is the backend, database, business rules, authentication, API documentation, and automated tests.

## 1. Technology Stack

Use:

* Node.js.
* TypeScript.
* Fastify.
* PostgreSQL.
* Prisma ORM.
* Zod for validation.
* JWT-based authentication.
* Argon2id or another appropriate secure password-hashing algorithm.
* A suitable logging solution.
* A testing framework such as Vitest.
* Environment-based configuration.

Use stable, mutually compatible dependency versions.

Use a modular architecture. Avoid putting all business logic inside route handlers.

## 2. Project Structure

Use a professional structure similar to:

backend/
prisma/
schema.prisma
migrations/
seed.ts
src/
app.ts
server.ts
config/
plugins/
middleware/
modules/
auth/
shops/
users/
categories/
products/
items/
qr/
inventory/
sales/
returns/
expenses/
reports/
settings/
synchronization/
common/
errors/
validation/
utils/
types/
tests/
.env.example
package.json
tsconfig.json
README.md
API.md
DATABASE.md

You may adjust the structure if necessary, but keep database operations, business logic, validation, and HTTP routing separated.

## 3. Multi-Shop Architecture

One deployed system must support multiple independent shops.

Create a Shop model and associate each user's access with the appropriate shop.

Every shop-owned record must be scoped to the correct shop, directly or through a validated relationship.

A user must never access another shop's products, items, sales, expenses, reports, or settings simply by changing an ID in a request.

Do not trust a shop ID supplied by the client without checking the authenticated user's membership and permissions.

Use PostgreSQL constraints, appropriate indexes, and transactions to protect data integrity.

## 4. Authentication and Authorization

Implement:

* User registration or owner onboarding.
* Login.
* Logout or token invalidation where supported.
* Access-token validation.
* Refresh-token handling if implemented.
* Password hashing.
* Owner and seller roles.
* User management for shop owners.
* Permission checks on protected endpoints.

Owners can manage their shops, products, inventory, sellers, sales, expenses, reports, and settings according to the implemented permissions.

Sellers can perform permitted sales and view authorized item and sales information.

Enforce all security rules on the backend. Frontend role checks are not a security boundary.

Validate input, limit abusive requests where appropriate, and avoid returning password hashes, token secrets, or sensitive internal details.

## 5. Database Design

Design a normalized PostgreSQL schema using Prisma.

At minimum, implement the following models.

### Shop

Represents a retail business.

Suggested fields:

* id
* name
* address, optional
* phone, optional
* currency
* createdAt
* updatedAt

### User

Represents a shop owner or seller.

Suggested fields:

* id
* name
* email or username
* passwordHash
* role
* active status
* createdAt
* updatedAt

If users can belong to multiple shops, use a separate shop-membership model with a role for each membership. Otherwise, clearly document the one-shop-per-user restriction.

### Category

Represents a product category.

Suggested fields:

* id
* shopId
* name
* description, optional
* createdAt
* updatedAt

### Product

Represents a catalog entry rather than a single physical piece.

Suggested fields:

* id
* shopId
* categoryId, optional
* name
* description, optional
* brand, optional
* defaultSellingPrice
* active status
* createdAt
* updatedAt

Optional product attributes may include size, color, model, or other identifiers. Do not make clothing-specific fields mandatory.

### Item

Represents one actual physical piece of merchandise.

Suggested fields:

* id
* shopId
* productId
* unique public item identifier or QR reference
* status
* costPrice
* sellingPrice, where appropriate
* registeredAt
* soldAt, optional
* createdBy
* createdAt
* updatedAt

Each physical piece must have its own unique identity and QR reference.

If a shop registers 20 pieces, create 20 item records. Do not represent them only as a quantity of 20.

Store the cost price per item so different purchase prices can be preserved for items belonging to the same product.

Use decimal-compatible database types for money. Avoid floating-point arithmetic for financial values.

Define and document the item lifecycle. Supported statuses should include:

* in_stock
* sold
* returned
* damaged

If additional states are needed for returns, reservations, or pending operations, define them explicitly.

A returned item must not automatically become sellable without applying the defined return and inspection rules.

### Sale

Represents one completed sale.

Suggested fields:

* id
* shopId
* sellerId
* sale reference
* status
* payment method
* subtotal
* discount
* total
* soldAt
* idempotency key, where appropriate
* createdAt

### SaleItem

Represents an individual item sold as part of a sale.

Suggested fields:

* id
* shopId
* saleId
* itemId
* productId or an appropriate historical product reference
* sellingPriceAtSale
* costPriceAtSale
* createdAt

Enforce that one physical item cannot belong to two completed sales.

Preserve historical item descriptions and prices where necessary so receipts and reports remain accurate if a product is renamed or its default price changes.

### StockMovement

Records changes to item status or inventory.

Suggested fields:

* id
* shopId
* itemId
* movement type
* previous status
* new status
* reason
* related sale or return reference, optional
* performedBy
* createdAt

Use this model as an auditable history of inventory changes.

### Expense

Represents shop expenses.

Suggested fields:

* id
* shopId
* recordedBy
* category
* description
* amount
* expenseDate
* createdAt
* updatedAt

### ShopSettings

Stores configurable shop information, receipt settings, and other relevant preferences.

### Return

Create a dedicated return model or equivalent auditable return structure.

Record the original sale, item, reason, decision, responsible user, timestamps, and final disposition.

### Synchronization operation

Define an idempotent operation or synchronization record for offline-created sales. It must allow the backend to recognize a retried operation rather than processing the same sale multiple times.

Finalize the full schema before completing the business logic. Document every relationship, constraint, index, and status transition in DATABASE.md.

## 6. QR Code Strategy

The backend must generate or assign a unique, unpredictable item reference suitable for use in a QR code.

The QR code should identify an item; it must not contain confidential information such as:

* Cost price.
* Passwords.
* Authentication tokens.
* Private user details.

Provide an API that returns the item's QR reference or payload.

The frontend can render this payload as a QR image using its QR library.

The backend must not assume that scanning a QR code proves an item is available for sale. It must verify the current item state and shop authorization.

Unknown or invalid references must return a safe error response.

## 7. Product and Item APIs

Implement endpoints for:

* Creating, listing, viewing, updating, and deactivating products.
* Managing categories.
* Registering individual items.
* Registering batches of items.
* Listing items by product or status.
* Retrieving an item by its QR reference.
* Viewing item details and history.
* Retrieving data needed for QR label printing.

When registering a batch, validate the requested quantity and all price values. Create the individual item records transactionally so a partially created batch does not remain if the operation fails.

Return the newly created item IDs and QR references.

Paginate large result sets and support useful filters.

## 8. Inventory APIs

Implement endpoints for:

* Inventory summaries.
* Listing items in stock.
* Filtering by status and product.
* Item movement history.
* Permitted item status changes.
* Low-stock summaries where appropriate.

Inventory totals must be based on item records and their current states, not an independently editable quantity field.

Record each meaningful status transition in StockMovement.

Enforce valid transitions on the server.

## 9. Sales APIs

Implement endpoints for:

* Creating a sale.
* Adding individual scanned items to a sale request.
* Viewing a sale.
* Listing sales.
* Filtering sales by date and seller.
* Retrieving receipt information.
* Viewing a seller's authorized sales history.

The backend must calculate and verify financial totals. Never trust totals sent by the frontend.

For every sale, preserve:

* Actual selling price at the time of sale.
* Cost price at the time of sale.
* Seller.
* Timestamp.
* Payment method.
* Items included.

### Transaction safety

The most important business rule is that an item cannot be sold twice.

Use a PostgreSQL transaction and appropriate row locking, conditional updates, or equivalent concurrency-safe techniques.

Within the transaction:

1. Authenticate the seller and determine the authorized shop.
2. Validate every requested item.
3. Confirm every item belongs to that shop.
4. Confirm every item is eligible for sale.
5. Prevent duplicate item IDs in the same request.
6. Calculate prices and totals on the server.
7. Create the sale and sale-item records.
8. Update item statuses.
9. Record stock movements.
10. Commit only if all required operations succeed.

If any item is unavailable, roll back the transaction rather than silently completing a partial sale.

If two sellers try to sell the same item simultaneously, only one operation may succeed.

If a sold item is scanned again, return a clear conflict response and, when authorized, the original sale date and seller.

Implement idempotency for sale requests so retries caused by timeouts or poor connectivity do not create duplicate sales.

Document the concurrency and idempotency design.

## 10. Returns and Damaged Items

Implement return and item-condition workflows.

A return should reference the original sale and the specific physical item.

Record the reason, responsible user, timestamps, and decision.

Define which roles may initiate, approve, or complete returns.

Do not automatically change a returned item to in_stock. Apply the documented inspection and disposition rules.

A damaged item must not be sold unless an authorized process explicitly changes its state.

Keep an auditable history of every change.

## 11. Expenses and Financial Reports

Implement expense CRUD operations with validation and role restrictions.

Provide report endpoints for:

* Daily, weekly, and monthly revenue.
* Number of items sold.
* Sales by seller.
* Sales by product.
* Best-selling products.
* Cost of goods sold.
* Gross profit.
* Expenses.
* Net profit.
* Stock value.

Use historical cost and selling prices captured at sale time.

Clearly document the financial definitions:

Revenue = completed sales after the defined discount treatment.

Cost of goods sold = the recorded cost prices of the items sold.

Gross profit = revenue minus cost of goods sold.

Net profit = gross profit minus the expenses included in the selected reporting period.

Do not describe net profit as a complete accounting measure unless taxes, other income, refunds, fees, and other relevant factors are also accounted for.

Stock value should use the chosen valuation rule, such as the stored cost price of eligible unsold items. Document how returned and damaged items are treated.

Use efficient PostgreSQL queries and indexes for reporting.

## 12. Offline Synchronization

The mobile app must be able to record sales locally when internet access is unavailable.

Design the backend to accept synchronization requests containing:

* A unique operation ID.
* The client-created sale reference.
* The authenticated user.
* The requested item IDs.
* Required sale details.
* Relevant client timestamps, when useful.

The server must not trust the client's claim that an item was available at the time of an offline sale.

When synchronization occurs:

1. Authenticate the user.
2. Verify shop permissions.
3. Check whether the operation was already processed.
4. Validate the requested items against current server state.
5. Process the sale transactionally if all required conditions hold.
6. Return a confirmed result or a structured conflict response.
7. Preserve enough information to make retries safe.

If another device sold an item while this device was offline, reject the conflicting sale and provide a useful error response.

Do not silently overwrite inventory states or create duplicate sale records.

Document the conflict-resolution rules.

Important limitation: the server cannot guarantee that two disconnected devices will never both locally record an attempted sale of the same item. It can guarantee that conflicting sales are not both accepted as completed server sales.

## 13. API Contract

Use a versioned or clearly organized REST API under:

/api

Agree on the API contract with the frontend developer before implementing every feature.

At minimum, define routes for:

Authentication:

* POST /api/auth/login
* POST /api/auth/logout
* GET /api/auth/me

Products and categories:

* GET /api/products
* POST /api/products
* GET /api/products/:id
* PATCH /api/products/:id
* GET /api/categories
* POST /api/categories

Items and QR:

* POST /api/items/batch
* GET /api/items
* GET /api/items/:id
* GET /api/items/qr/:qrReference
* GET /api/items/:id/movements

Inventory:

* GET /api/inventory/summary
* GET /api/inventory/movements

Sales:

* POST /api/sales
* GET /api/sales
* GET /api/sales/:id
* GET /api/sales/:id/receipt

Returns:

* POST /api/returns
* GET /api/returns
* GET /api/returns/:id

Expenses:

* GET /api/expenses
* POST /api/expenses
* PATCH /api/expenses/:id
* DELETE /api/expenses/:id, if deletion is permitted by the audit policy

Reports:

* GET /api/reports/dashboard
* GET /api/reports/sales
* GET /api/reports/profit
* GET /api/reports/best-sellers
* GET /api/reports/stock-value

Synchronization:

* POST /api/sync/sales

Settings and users:

* GET /api/settings
* PATCH /api/settings
* GET /api/users
* POST /api/users
* PATCH /api/users/:id

These are the initial proposed routes. Refine them as needed, but document every implemented route, request schema, response schema, authorization rule, and error status in API.md.

Use consistent response structures, for example:

Success:
{
"success": true,
"data": {}
}

Error:
{
"success": false,
"message": "A useful explanation",
"errors": []
}

Use appropriate HTTP status codes, including 400 for invalid requests, 401 for unauthenticated requests, 403 for forbidden actions, 404 for missing resources, 409 for conflicts, and 500 for unexpected server errors.

Do not return internal stack traces or database details to clients.

## 14. Database and Deployment Configuration

Use environment variables for:

* DATABASE_URL
* JWT_SECRET or the selected signing-key configuration.
* PORT
* NODE_ENV
* CORS_ORIGIN

Provide `.env.example` with placeholders only.

Never commit real credentials or `.env` files.

Include Prisma migrations, a development seed script, and instructions for setting up PostgreSQL locally or with a managed PostgreSQL service.

Ensure production startup does not depend on development seed data.

Provide a health endpoint, such as GET /api/health.

The backend should be deployable independently of the mobile app.

## 15. Testing

Write tests for:

* Authentication and role authorization.
* Shop data isolation.
* Product and batch-item creation.
* QR-reference uniqueness.
* Valid and invalid item status transitions.
* Successful sales.
* Repeated sale attempts.
* Two simultaneous attempts to sell the same item.
* Idempotent retries.
* Returns and damaged items.
* Historical cost-price accuracy.
* Report calculations.
* Offline synchronization conflicts.
* Validation and error handling.

Use an isolated test database or another reliable test setup.

Do not consider a transaction-safe sale implementation complete until its duplicate-sale and concurrency behavior has been tested.

## 16. Development Stages

Stage 1: Initialize the Node.js and TypeScript backend.

Stage 2: Design the PostgreSQL schema and Prisma migrations.

Stage 3: Implement authentication, users, shop access, and authorization.

Stage 4: Implement products, categories, individual items, and QR references.

Stage 5: Implement inventory history and valid status transitions.

Stage 6: Implement transaction-safe sales, receipts, and idempotency.

Stage 7: Implement returns, damaged items, and expenses.

Stage 8: Implement dashboard and financial reports.

Stage 9: Implement offline synchronization and conflict handling.

Stage 10: Complete tests, API documentation, and deployment preparation.

## 17. Deliverables

Provide:

1. Complete TypeScript backend source code.
2. Prisma schema and migrations.
3. PostgreSQL setup instructions.
4. Authentication and role-based authorization.
5. Documented REST endpoints.
6. Transaction-safe sales logic.
7. QR item-reference support.
8. Inventory movement history.
9. Returns and expenses.
10. Financial reporting.
11. Offline synchronization endpoints.
12. Automated tests.
13. `.env.example`.
14. README.md.
15. API.md.
16. DATABASE.md.

Build a working backend, not a collection of placeholder routes.

Prioritize correctness, security, data integrity, and a clear API contract over unnecessary complexity. Start by finalizing the schema and API documentation, then implement the backend feature by feature.
