# Project: Store Management App

## Role: Frontend Developer

Act as a senior React Native developer and mobile application architect. Build the frontend of a production-oriented, QR-based Store Management App for general retail businesses.

This is a general store management system, not a clothing-specific application. It must support different kinds of retail products, including clothes, shoes, electronics, cosmetics, accessories, and other physical goods.

The backend will be developed independently by another team member. Your responsibility is the mobile application frontend, including screens, navigation, QR scanning, user interactions, local data storage, offline behavior, and API integration.

Follow the specifications carefully. Do not build the backend or create a separate database server.

## 1. Technology Stack

Use the following technologies:

* React Native with Expo.
* TypeScript.
* Expo Router for navigation.
* React Native Paper for UI components.
* expo-camera for QR and barcode scanning.
* react-native-qrcode-svg for displaying QR codes.
* expo-print for printable QR label sheets and receipts.
* TanStack Query for server-state management.
* expo-sqlite for local storage and offline sales.
* A suitable network-connectivity library to detect online/offline status.
* React Hook Form and Zod for form handling and validation.
* A chart library compatible with the selected Expo SDK for reports.

Use stable, mutually compatible package versions. Follow current Expo installation guidance rather than assuming every package works with every Expo version.

## 2. Application Architecture

Organize the frontend professionally. Use a feature-based structure similar to this:

src/
components/
common/
forms/
layout/
feedback/
features/
auth/
dashboard/
shops/
products/
items/
qr-scanner/
inventory/
sales/
returns/
expenses/
reports/
settings/
synchronization/
database/
migrations/
repositories/
hooks/
navigation/
services/
api/
auth/
types/
utils/
constants/

app/
_layout.tsx
index.tsx
login.tsx
dashboard/
products/
items/
scanner/
inventory/
sales/
returns/
expenses/
reports/
settings/

You may adjust the structure to fit Expo Router conventions, but keep the architecture organized, modular, and maintainable.

Keep UI components, business logic, API communication, and local database operations separate.

## 3. Authentication and User Roles

Create screens for:

* Login.
* Session loading.
* Logout.
* Unauthorized access.
* Session expiration.

Support two roles:

OWNER:

* Access the shop dashboard.
* Manage products and individual items.
* View inventory.
* Process or review sales.
* Manage sellers.
* View reports and profit.
* Manage expenses and shop settings.
* Manage QR label printing.

SELLER:

* Scan items.
* View available item details.
* Process permitted sales.
* View their own sales history.
* Record permitted returns when authorized.

The app must obtain the user's permissions from the backend. Do not treat hiding a button as sufficient security; the backend is responsible for enforcing authorization.

Do not store passwords in the frontend database. Store authentication tokens using an appropriate secure-storage mechanism.

## 4. Shop and Product Management

Build screens for:

* Product list.
* Product search and filtering.
* Product details.
* Add product.
* Edit product.
* Category management.
* Register physical items.
* View all individual items belonging to a product.

A product represents a catalog entry. An item represents one actual physical piece in the shop.

Example:

Product: Wireless Headphones
Default selling price: ETB 1,500

The owner registers 20 physical pieces.

The system should create 20 individual item records through the backend, each with its own unique item ID and QR code.

The frontend must clearly distinguish between the catalog product and its individual physical items.

A product may contain optional attributes such as size, color, model, or serial number. Do not require clothing-specific attributes for every product.

When registering a batch of items, allow the user to enter:

* Number of physical pieces.
* Cost price for each piece or a common cost price for the batch.
* Selling price or default product price.
* Optional item-specific details.

The frontend must display the individual item records returned by the backend. Do not generate fake production item IDs or assume that an item has been saved before the backend confirms it.

## 5. QR Code Management

Each physical item must have its own unique QR code.

Implement:

* Displaying an item's QR code.
* Viewing item details from its QR code.
* Generating printable labels for multiple registered items.
* Printing QR labels using expo-print and a suitable print layout.
* Scanning QR codes using the device camera.
* Clear permission-denied and camera-error messages.
* Invalid-code and unknown-item messages.

The QR code should encode an opaque, unique item identifier or a backend-defined item reference. Do not place passwords, authentication tokens, cost prices, or other sensitive information inside the QR code.

Support batch label layouts suitable for sticker sheets. Keep label dimensions and layout configurable where practical.

Provide a print preview before printing.

Do not claim that Bluetooth label printing works unless a compatible printer integration has actually been implemented and tested. Treat Bluetooth printing as a later extension.

## 6. QR Scanning and Sales

Create a dedicated scanning screen.

When a seller scans a QR code:

1. Validate the scanned code's format.
2. Resolve the item using the backend or a locally cached record.
3. Display the product name, item identifier, price, and current status.
4. If the item is available, allow the seller to proceed with the sale.
5. If the item has already been sold, display a message such as "This item was already sold" and show the recorded sale date and seller when authorized and available.
6. If the item is damaged, returned, or otherwise unavailable, show its status and the permitted next actions.
7. If the code is unknown, display a clear error message.

A sale screen should show:

* Scanned items.
* Item prices.
* Discount, when permitted.
* Total amount.
* Payment method.
* Confirmation action.
* Sale receipt after successful confirmation.

Allow multiple different items to be scanned into a single sale.

Scanning the same item twice must not add it twice to the same sale.

The frontend must never mark an item as sold merely because the QR code was scanned. The backend must confirm a successful transaction before the interface displays a completed sale.

If the backend reports that another seller has already sold the item, show the conflict clearly and refresh the item's status.

Do not rely on frontend checks alone to prevent duplicate sales.

## 7. Inventory Management

Build an inventory screen showing:

* Total registered items.
* Items in stock.
* Sold items.
* Returned items.
* Damaged items.
* Items unavailable for sale.
* Stock movement history.

Allow users to filter by product, category, item status, and date when supported by the API.

Display item-level details and the reason for stock changes.

The stock count should be calculated from the individual item records and their statuses, not by directly editing an arbitrary stock quantity.

Do not let the frontend silently change an item's status. Send permitted changes to the backend and display the confirmed result.

## 8. Sales and Receipts

Create:

* Sales history.
* Sale details.
* Sales filtering.
* Receipt display.
* Printable receipts.
* Seller-specific sales history.

Receipts should contain:

* Shop information.
* Sale reference.
* Date and time.
* Seller.
* Items sold.
* Item prices.
* Discounts, if applicable.
* Total paid.
* Payment method.

Use the sale information returned by the backend. Preserve historical selling prices even if the product's default price changes later.

Handle pending, failed, and successful sales clearly.

## 9. Returns and Damaged Items

Create screens to view item history and initiate permitted returns or status changes.

Show:

* Original sale reference.
* Original sale date.
* Item details.
* Return reason.
* Current status.
* Available actions based on permissions.

Do not automatically return an item to sellable inventory just because the user selects "Return." Follow the status and return rules defined by the backend.

## 10. Expenses and Reports

Create expense screens for:

* Expense list.
* Add expense.
* Expense categories.
* Expense details.
* Filtering by date.

Create owner reporting screens for:

* Daily, weekly, and monthly sales.
* Revenue.
* Cost of goods sold.
* Gross profit.
* Expenses.
* Net profit.
* Best-selling products.
* Current stock value.

Display monetary values in Ethiopian birr (ETB) by default. Keep formatting configurable if the backend supports other currencies.

The frontend must use authoritative figures returned by the backend. Do not calculate official business profit using incomplete local data.

Provide clear empty states when there are no sales or expenses.

## 11. Dashboard

Build a clean dashboard that summarizes:

* Today's sales.
* Number of items sold.
* Available stock.
* Low-stock alerts where applicable.
* Recent sales.
* Recent stock movements.
* Revenue and profit summaries for authorized users.

Make the dashboard role-aware. Sellers should not see owner-only financial information unless explicitly permitted.

Use charts only when they make information easier to understand.

## 12. Offline Mode

Offline operation is an important requirement.

Use expo-sqlite to store the minimum data required for the app to work offline, such as:

* Cached product and item information.
* Locally recorded sale attempts.
* Pending synchronization operations.
* Synchronization status.

Design a local synchronization queue.

When the app is offline:

1. Show a persistent offline indicator.
2. Allow scanning against cached item data.
3. Allow an eligible seller to prepare and record a pending local sale.
4. Clearly label the sale as pending synchronization.
5. Store the operation locally.
6. Retry synchronization when connectivity returns.

Use unique operation IDs for locally created sale operations.

Do not display an offline sale as a confirmed server sale before the backend accepts it.

A previously cached item may have been sold by another seller while the device was offline. Therefore, explain and handle synchronization conflicts.

The backend remains authoritative. If a conflict occurs, do not silently overwrite the server's state. Display the conflict and follow the backend's resolution response.

Do not promise guaranteed prevention of duplicate sales across multiple offline devices. Explain that cross-device confirmation requires synchronization with the server.

Protect sensitive local data appropriately, and do not store authentication secrets in ordinary SQLite records.

## 13. API Integration

The backend developer will provide a REST API.

Use a centralized API client and configurable base URL.

Example development configuration:

EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api

Do not hard-code the backend URL throughout the application.

Important: localhost on a physical mobile phone refers to the phone itself, not the developer's computer. Document how to configure the computer's local network IP address or an appropriate emulator URL for development.

Organize API functions by feature:

* authApi
* productsApi
* itemsApi
* salesApi
* inventoryApi
* returnsApi
* expensesApi
* reportsApi
* settingsApi
* syncApi

Use TanStack Query for fetching, caching, invalidation, and mutation state.

Handle loading states, API validation errors, unauthorized responses, network failures, and server errors consistently.

Coordinate with the backend developer on endpoint names, request bodies, response formats, status codes, pagination, and authentication.

Document any frontend assumptions in API_INTEGRATION.md.

Do not invent successful API responses. During independent frontend development, use clearly identified mock data behind a development-only repository or service layer. Make it possible to switch to the real API without rewriting the screens.

Never commit secrets or production credentials.

## 14. UI and User Experience

Design a modern, simple, professional mobile application.

Requirements:

* Clear navigation.
* Readable text.
* Consistent spacing.
* Accessible buttons.
* Clear status labels.
* Useful confirmation dialogs for important actions.
* Helpful error messages.
* Responsive layouts across supported phone sizes.
* Good loading, empty, offline, and error states.
* Minimal unnecessary steps for scanning and selling an item.

Prioritize fast scanning and selling. A seller should be able to scan an item, verify the price, and complete a sale with as few steps as practical.

Avoid unnecessary animations, excessive decoration, and complicated screens.

## 15. Testing

Test:

* Login and logout UI.
* Role-aware navigation.
* Product and item forms.
* QR scanning and invalid codes.
* Duplicate scans.
* Sale confirmation and failed transactions.
* Printing previews.
* Offline sale recording.
* Synchronization retries.
* Conflict handling.
* Reports and empty states.
* API error handling.

Include unit tests for important frontend logic and component tests where practical.

## 16. Development Stages

Work in these stages:

Stage 1: Initialize Expo, TypeScript, navigation, theme, and project structure.

Stage 2: Implement authentication screens and role-aware navigation.

Stage 3: Implement products, categories, individual item registration, and item details.

Stage 4: Implement QR display, scanning, and label printing.

Stage 5: Implement sales, receipts, inventory, and stock history.

Stage 6: Implement expenses, reports, and dashboard.

Stage 7: Implement local storage, offline sale recording, and synchronization.

Stage 8: Integrate the actual backend API.

Stage 9: Test the complete application, fix bugs, and document setup.

## 17. Deliverables

Provide:

1. Complete frontend source code.
2. Organized and reusable components.
3. Working navigation and screens.
4. QR scanning and label-printing implementation.
5. Local SQLite storage and synchronization structure.
6. Centralized API integration.
7. `.env.example`.
8. README.md with installation and run instructions.
9. API_INTEGRATION.md documenting required endpoints and assumptions.
10. Tests for critical frontend behavior.

Build a working application, not merely static screen designs.

Before implementing a feature that depends on the backend, define its expected API contract. Coordinate with the backend developer instead of independently inventing incompatible data structures.

Start by creating the project structure and implementing the core navigation and authentication flow. Then proceed feature by feature.
