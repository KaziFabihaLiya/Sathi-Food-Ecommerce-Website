# Shathi Food Ghee E-Commerce — API Documentation

This document describes all REST API endpoints for the Shathi Food Ghee platform.

---

## General Conventions

- **Base URL**: `http://localhost:3000` (or production domain)
- **Error Format**: All non-2xx responses strictly follow the structure:
  ```json
  {
    "error": "Human readable error description"
  }
  ```
- **Authentication**:
  - Public routes require no credentials.
  - Admin routes under `/api/admin/*` require an active Auth.js session (JWT session cookie `authjs.session-token`).
  - Unauthenticated requests to `/api/admin/*` receive `401 Unauthorized`:
    ```json
    {
      "error": "Unauthorized"
    }
    ```

---

## Public Endpoints

### 1. Get Products
Retrieve all active products for the storefront, sorted by `sortOrder`.

- **Method**: `GET`
- **Route**: `/api/products`
- **Authentication**: None
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "cm3r5gold0001",
      "slug": "gold-ghee",
      "name": "Gold Ghee",
      "tagline": "Made from Milk",
      "description": "Our Gold Ghee is made from fresh cow's milk using the traditional bilona method...",
      "features": [
        "Rich golden color",
        "Aroma of tradition",
        "Perfect for everyday cooking",
        "Nourishing and wholesome"
      ],
      "price": 999,
      "weightGrams": 500,
      "stock": 48,
      "inStock": true,
      "imageUrl": "/images/gold-ghee.jpg",
      "imagePublicId": null,
      "badge": "Made from Milk",
      "active": true,
      "sortOrder": 1,
      "createdAt": "2026-11-21T02:00:00.000Z",
      "updatedAt": "2026-11-21T02:00:00.000Z"
    }
  ]
  ```

---

### 2. Get Customer Reviews
Retrieve all active customer review cards/images.

- **Method**: `GET`
- **Route**: `/api/reviews`
- **Authentication**: None
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "cm3r6rev0001",
      "imageUrl": "https://res.cloudinary.com/cloud/image/upload/v1/shathi/reviews/sample.jpg",
      "imagePublicId": "shathi/reviews/sample",
      "caption": "The aroma and taste are unmatched! Pure tradition.",
      "active": true,
      "sortOrder": 1,
      "createdAt": "2026-11-21T02:00:00.000Z",
      "updatedAt": "2026-11-21T02:00:00.000Z"
    }
  ]
  ```

---

### 3. Place Order (COD)
Create a new Cash on Delivery (COD) order.

- **Method**: `POST`
- **Route**: `/api/orders`
- **Rate Limit**: 5 requests per minute per client IP (`429 Too Many Requests` when exceeded)
- **Honeypot Protection**: The field `website` is a bot trap. If provided, returns fake `201 Created` without persisting data.
- **Request Headers**:
  `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "productId": "cm3r5gold0001",
    "quantity": 2,
    "name": "Abdur Rahman",
    "phone": "01712345678",
    "address": "House 12, Road 5, Dhanmondi",
    "district": "Dhaka",
    "note": "Please call before delivery",
    "website": ""
  }
  ```
- **Validation Rules**:
  - `productId`: String, required.
  - `quantity`: Integer between 1 and 20.
  - `phone`: Regular expression `/^01[3-9]\d{8}$/` (11-digit valid Bangladeshi phone number).
  - `address` & `district`: Required non-empty strings.
- **Response (201 Created)**:
  ```json
  {
    "invoiceNo": "INV-2026-0001",
    "total": 1998
  }
  ```
- **Error Responses**:
  - `400 Bad Request`:
    ```json
    { "error": "Insufficient stock available for this product" }
    ```
  - `429 Too Many Requests`:
    ```json
    { "error": "Too many requests. Please try again later." }
    ```

---

## Admin Endpoints (Require Admin Session)

### 4. Admin Dashboard Overview
Retrieve real-time metrics for today and this month, calculated with `Asia/Dhaka` (UTC+6) timezone.

- **Method**: `GET`
- **Route**: `/api/admin/dashboard`
- **Authentication**: Admin session required
- **Response (200 OK)**:
  ```json
  {
    "ordersToday": 14,
    "pendingOrders": 5,
    "revenueThisMonth": 189810,
    "recentOrders": [
      {
        "id": "cm3r7ord0001",
        "invoiceNo": "INV-2026-0014",
        "customerName": "Abdur Rahman",
        "phone": "01712345678",
        "itemsSummary": "Gold Ghee x 2",
        "total": 1998,
        "status": "PENDING"
      }
    ]
  }
  ```

---

### 5. List All Products (Admin)
Retrieve all products in the catalog, including hidden (`active: false`) ones.

- **Method**: `GET`
- **Route**: `/api/admin/products`
- **Authentication**: Admin session required
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "cm3r5gold0001",
      "slug": "gold-ghee",
      "name": "Gold Ghee",
      "tagline": "Made from Milk",
      "description": "...",
      "features": ["..."],
      "price": 999,
      "weightGrams": 500,
      "stock": 48,
      "imageUrl": "/images/gold-ghee.jpg",
      "imagePublicId": null,
      "badge": "Made from Milk",
      "active": true,
      "sortOrder": 1,
      "createdAt": "2026-11-21T02:00:00.000Z",
      "updatedAt": "2026-11-21T02:00:00.000Z"
    }
  ]
  ```

---

### 6. Update Product Details
Update product text, stock, price, status, or sorting. (Adding or deleting products is permanently disabled).

- **Method**: `PATCH`
- **Route**: `/api/admin/products/[id]`
- **Authentication**: Admin session required
- **Request Body (JSON)**:
  ```json
  {
    "price": 1050,
    "stock": 60,
    "active": true,
    "badge": "Bestseller"
  }
  ```
- **Response (200 OK)**: Updated `Product` object.
- **Error (404 Not Found)**:
  ```json
  { "error": "Product not found" }
  ```

---

### 7. Upload Product Image
Upload or replace a product's image via Cloudinary (`shathi/products`). The previous image is automatically deleted from Cloudinary.

- **Method**: `POST`
- **Route**: `/api/admin/products/[id]/image`
- **Authentication**: Admin session required
- **Request Headers**: `multipart/form-data`
- **Request Fields**:
  - `image`: File (max 3MB; formats: `.jpg`, `.jpeg`, `.png`, `.webp`)
- **Response (200 OK)**:
  ```json
  {
    "id": "cm3r5gold0001",
    "imageUrl": "https://res.cloudinary.com/cloud/image/upload/v1/shathi/products/sample.webp",
    "imagePublicId": "shathi/products/sample",
    ...
  }
  ```

---

### 8. Get Order Details
Retrieve full details of an order, including snapshot items and customer info.

- **Method**: `GET`
- **Route**: `/api/admin/orders/[id]`
- **Authentication**: Admin session required
- **Response (200 OK)**:
  ```json
  {
    "id": "cm3r7ord0001",
    "invoiceNo": "INV-2026-0001",
    "customerId": "cm3r7cust0001",
    "customerName": "Abdur Rahman",
    "customerPhone": "01712345678",
    "customerAddress": "House 12, Road 5, Dhanmondi",
    "customerDistrict": "Dhaka",
    "note": "Please call before delivery",
    "paymentMethod": "COD",
    "status": "PENDING",
    "total": 1998,
    "createdAt": "2026-11-21T02:00:00.000Z",
    "updatedAt": "2026-11-21T02:00:00.000Z",
    "items": [
      {
        "id": "cm3r7item0001",
        "orderId": "cm3r7ord0001",
        "productId": "cm3r5gold0001",
        "productName": "Gold Ghee",
        "unitPrice": 999,
        "quantity": 2
      }
    ]
  }
  ```

---

### 9. Update Order Status & Automatic Inventory Transition
Update status (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Inventory Transition Rules**:
  - Transition to `CANCELLED` from any status &rarr; Automatically restocks items.
  - Transition from `CANCELLED` to any active status &rarr; Checks and decrements stock again; rejects with `400` if insufficient stock.
  - Any other transition &rarr; Preserves stock as-is.

- **Method**: `PATCH`
- **Route**: `/api/admin/orders/[id]`
- **Authentication**: Admin session required
- **Request Body (JSON)**:
  ```json
  {
    "status": "CONFIRMED"
  }
  ```
- **Response (200 OK)**: Updated `Order` object with items.
- **Error (400 Bad Request)**:
  ```json
  { "error": "Insufficient stock to uncancel order. Product \"Gold Ghee\" has 0 available, need 2." }
  ```

---

### 10. Reviews Management (Admin)

#### List Reviews
- **Method**: `GET`
- **Route**: `/api/admin/reviews`
- **Response (200 OK)**: Array of all `Review` items.

#### Upload Review
- **Method**: `POST`
- **Route**: `/api/admin/reviews`
- **Request**: `multipart/form-data` with `image` (max 3MB), optional `caption`, `sortOrder`, `active`.
- **Response (201 Created)**: Created `Review` object.

#### Update Review
- **Method**: `PATCH`
- **Route**: `/api/admin/reviews/[id]` (or `/api/admin/reviews` with `id` in body)
- **Request Body (JSON)**:
  ```json
  {
    "caption": "Customer photo review",
    "sortOrder": 2,
    "active": true
  }
  ```
- **Response (200 OK)**: Updated `Review` object.

#### Delete Review
- **Method**: `DELETE`
- **Route**: `/api/admin/reviews/[id]` (or `/api/admin/reviews?id=...`)
- **Response (200 OK)**:
  ```json
  { "message": "Review deleted successfully" }
  ```
