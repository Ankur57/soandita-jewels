# API Documentation - E-Commerce Server

## Overview

This is a Node.js/Express-based REST API for a full-featured e-commerce platform. The API supports user authentication, product management, shopping cart operations, order processing, and payment integration with Razorpay.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Payment Gateway**: Razorpay
- **Development**: Nodemon

## Getting Started

### Installation

```bash
cd Server
npm install
```

### Environment Variables

Create a `.env` file in the Server directory:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000` by default.

---

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### Register User
- **URL**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Create a new user account
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "mobileNumber": "9876543210"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
  ```
- **Error Responses**:
  - 400: User already exists
  - 500: Server error

#### Login User
- **URL**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
  ```
- **Error Responses**:
  - 400: Invalid credentials
  - 500: Server error

---

### 2. Product Routes (`/api/products`)

#### Get All Products
- **URL**: `GET /api/products`
- **Access**: Public
- **Description**: Retrieve all active products with category information
- **Query Parameters**: None
- **Response** (200 OK):
  ```json
  [
    {
      "_id": "product_id",
      "name": "Product Name",
      "slug": "product-name",
      "sku": "SKU123",
      "description": "Product description",
      "categoryId": {
        "_id": "category_id",
        "name": "Category Name"
      },
      "price": 999,
      "images": ["url1", "url2"],
      "stock": 50,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
  ```

#### Get Single Product
- **URL**: `GET /api/products/:id`
- **Access**: Public
- **Description**: Retrieve a specific product by ID
- **URL Parameters**: 
  - `id`: Product ID
- **Response** (200 OK): Single product object
- **Error Responses**:
  - 404: Product not found
  - 500: Server error

#### Add Product (Admin Only)
- **URL**: `POST /api/products`
- **Access**: Protected (Admin)
- **Description**: Create a new product
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "New Product",
    "slug": "new-product",
    "sku": "SKU456",
    "description": "Product details",
    "categoryId": "category_id",
    "price": 1999,
    "images": ["url1"],
    "stock": 100
  }
  ```
- **Response** (201 Created): Created product object
- **Error Responses**:
  - 401: Not authorized/No token
  - 403: Admin access required
  - 500: Server error

#### Update Product (Admin Only)
- **URL**: `PUT /api/products/:id`
- **Access**: Protected (Admin)
- **Description**: Update product details
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameters**: 
  - `id`: Product ID
- **Request Body**: Any product fields to update
- **Response** (200 OK): Updated product object
- **Error Responses**:
  - 404: Product not found
  - 401/403: Authorization error
  - 500: Server error

#### Delete Product (Admin Only - Soft Delete)
- **URL**: `DELETE /api/products/:id`
- **Access**: Protected (Admin)
- **Description**: Deactivate a product (soft delete - sets isActive to false)
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameters**: 
  - `id`: Product ID
- **Response** (200 OK):
  ```json
  {
    "message": "Product deactivated"
  }
  ```
- **Error Responses**:
  - 404: Product not found
  - 401/403: Authorization error
  - 500: Server error

---

### 3. Category Routes (`/api/categories`)

#### Get All Categories
- **URL**: `GET /api/categories`
- **Access**: Public
- **Description**: Retrieve all active product categories
- **Response** (200 OK):
  ```json
  [
    {
      "_id": "category_id",
      "name": "Category Name",
      "description": "Category description",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
  ```

#### Create Category (Admin Only)
- **URL**: `POST /api/categories`
- **Access**: Protected (Admin)
- **Description**: Create a new product category
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Electronics",
    "description": "Electronic products"
  }
  ```
- **Response** (201 Created): Created category object
- **Error Responses**:
  - 401: Not authorized/No token
  - 403: Admin access required
  - 500: Server error

---

### 4. Cart Routes (`/api/cart`)

All cart endpoints require authentication.

#### Get Cart
- **URL**: `GET /api/cart`
- **Access**: Protected
- **Description**: Retrieve the current user's shopping cart
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "productId": {
          "_id": "product_id",
          "name": "Product Name",
          "price": 999
        },
        "quantity": 2,
        "priceAtTime": 999
      }
    ],
    "totalAmount": 1998
  }
  ```
- **Empty Cart**: Returns `{ "items": [], "totalAmount": 0 }`

#### Add to Cart
- **URL**: `POST /api/cart/add`
- **Access**: Protected
- **Description**: Add a product to cart (or increase quantity if already exists)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "productId": "product_id",
    "quantity": 2
  }
  ```
- **Response** (200 OK): Updated cart object
- **Error Responses**:
  - 404: Product not found or inactive
  - 401: Not authorized
  - 500: Server error

#### Update Cart Item Quantity
- **URL**: `PUT /api/cart/update`
- **Access**: Protected
- **Description**: Update the quantity of an item in the cart
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "productId": "product_id",
    "quantity": 5
  }
  ```
- **Response** (200 OK): Updated cart object
- **Error Responses**:
  - 404: Cart or item not found
  - 401: Not authorized
  - 500: Server error

#### Remove Item from Cart
- **URL**: `DELETE /api/cart/remove`
- **Access**: Protected
- **Description**: Remove a product from the cart
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "productId": "product_id"
  }
  ```
- **Response** (200 OK): Updated cart object
- **Error Responses**:
  - 404: Cart not found
  - 401: Not authorized
  - 500: Server error

---

### 5. Address Routes (`/api/addresses`)

All address endpoints require authentication.

#### Add Address
- **URL**: `POST /api/addresses`
- **Access**: Protected
- **Description**: Add a new delivery address for the user
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "mobileNumber": "9876543210",
    "addressLine1": "123 Main Street, Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001"
  }
  ```
- **Response** (201 Created): Created address object
- **Error Responses**:
  - 401: Not authorized
  - 500: Server error

#### Get User Addresses
- **URL**: `GET /api/addresses`
- **Access**: Protected
- **Description**: Retrieve all addresses saved by the user
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  [
    {
      "_id": "address_id",
      "userId": "user_id",
      "fullName": "John Doe",
      "mobileNumber": "9876543210",
      "addressLine1": "123 Main Street, Apt 4B",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Error Responses**:
  - 401: Not authorized
  - 500: Server error

---

### 6. Order Routes (`/api/orders`)

#### Create Order (Checkout)
- **URL**: `POST /api/orders`
- **Access**: Protected
- **Description**: Convert cart items into an order. Validates stock, reduces inventory, and clears the cart.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "addressId": "address_id"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "_id": "order_id",
    "orderNumber": "SJ-1704110400000",
    "userId": "user_id",
    "items": [
      {
        "productId": "product_id",
        "name": "Product Name",
        "quantity": 2,
        "priceAtTime": 999
      }
    ],
    "subtotal": 1998,
    "shippingCharges": 0,
    "totalAmount": 1998,
    "orderStatus": "pending",
    "paymentStatus": "pending",
    "addressSnapshot": {
      "fullName": "John Doe",
      "mobileNumber": "9876543210",
      "addressLine1": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
  ```
- **Error Responses**:
  - 400: Empty cart or insufficient stock
  - 404: Address not found
  - 401: Not authorized
  - 500: Server error

---

### 7. Payment Routes (`/api/payment`)

All payment endpoints require authentication.

#### Create Payment Order
- **URL**: `POST /api/payment/create-order`
- **Access**: Protected
- **Description**: Verify cart items and stock, compute order amount, and create a Razorpay payment order. Pre-payment stock verification guarantees quantity <= available stock before opening payment gateway. Order is NOT created yet to avoid orphaned pending orders.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "addressId": "delivery_address_id"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "razorpayOrderId": "order_DBJepzybf123",
    "amount": 199900,
    "currency": "INR",
    "key": "rzp_live_xxxxx"
  }
  ```
- **Error Responses**:
  - 400: Cart empty or insufficient stock
  - 404: Delivery address not found
  - 401: Not authorized
  - 500: Server error

#### Verify Payment & Create Order
- **URL**: `POST /api/payment/verify`
- **Access**: Protected
- **Description**: Cryptographically verify Razorpay HMAC-SHA256 signature. Upon successful payment verification, atomic stock deduction takes place, the Order is created with status "paid" and paymentStatus "success", the user's cart is cleared, and an order confirmation email is sent.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_DBJepzybf123",
    "razorpay_payment_id": "pay_EAznOHGVDv8ksn",
    "razorpay_signature": "9ef4dffbfd84f1318f6739a13ce19f9d85851857"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "Payment verified successfully",
    "order": { ... }
  }
  ```
- **Error Responses**:
  - 400: Payment verification failed (invalid signature) or stock discrepancy
  - 404: Payment record not found
  - 401: Not authorized
  - 500: Server error

---

### 8. Test Routes (`/api/test`)

#### Protected Route Test
- **URL**: `GET /api/test/profile`
- **Access**: Protected
- **Description**: Test endpoint to verify authentication middleware
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "message": "Protected route accessed",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```

#### Admin Only Test
- **URL**: `GET /api/test/admin`
- **Access**: Protected (Admin)
- **Description**: Test endpoint to verify admin-only access
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "message": "Admin route accessed"
  }
  ```
- **Error Responses**:
  - 403: Admin access denied

---

## Middleware

### Authentication Middleware (`protect`)
Verifies JWT token from the `Authorization` header (format: `Bearer <token>`).
- Decodes the token and attaches user information to `req.user`
- Required for protected routes
- Returns 401 error if token is missing or invalid

### Admin Authorization Middleware (`adminOnly`)
Checks if the authenticated user has an "admin" role.
- Used in conjunction with `protect` middleware
- Returns 403 error if user is not an admin

---

## Database Models

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  mobileNumber: String (required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  timestamps: true
}
```

### Product Schema
```javascript
{
  name: String (required),
  slug: String (required, unique),
  sku: String (required, unique),
  description: String (required),
  categoryId: ObjectId (ref: Category),
  price: Number (required),
  images: [String],
  stock: Number (required),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Category Schema
Currently stores active categories. Supports product categorization.

### Cart Schema
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    quantity: Number,
    priceAtTime: Number
  }],
  totalAmount: Number,
  timestamps: true
}
```

### Order Schema
```javascript
{
  orderNumber: String (unique),
  userId: ObjectId (ref: User),
  paymentId: ObjectId (ref: Payment),
  items: [{
    productId: ObjectId,
    name: String,
    quantity: Number,
    priceAtTime: Number
  }],
  subtotal: Number,
  shippingCharges: Number (default: 0),
  totalAmount: Number,
  orderStatus: String (enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned']),
  paymentStatus: String (enum: ['pending', 'success', 'failed', 'refunded']),
  addressSnapshot: {
    fullName, mobileNumber, addressLine1, city, state, postalCode
  },
  timestamps: true
}
```

### Payment Schema
Stores Razorpay payment transaction details.

### Address Schema
```javascript
{
  userId: ObjectId (ref: User),
  fullName: String,
  mobileNumber: String,
  addressLine1: String,
  city: String,
  state: String,
  postalCode: String,
  timestamps: true
}
```

---

## Features

### 1. **User Authentication**
- Secure registration with password hashing (bcryptjs)
- JWT-based login with 7-day token expiry
- Role-based access control (User/Admin)

### 2. **Product Management**
- Admin can add, update, and soft-delete products
- Products are categorized
- Stock tracking and inventory management
- Products are filtered by active status

### 3. **Shopping Cart**
- Add, update, and remove items
- Automatic total calculation
- Cart persistence per user

### 4. **Order Processing**
- Cart to order conversion
- Automatic stock reduction
- Order number generation
- Address snapshot capture at time of order

### 5. **Payment Integration**
- Razorpay payment gateway integration
- Order creation for payment
- Payment verification with HMAC-SHA256 signature validation
- Amount verification to prevent tampering

### 6. **Shipment Management**
- Automatic shipment creation after payment verification
- Integrates with Shiprocket service

### 7. **Address Management**
- Users can save multiple delivery addresses
- Used during checkout

---

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error description"
}
```

**Common HTTP Status Codes**:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions (Admin required)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

---

## Security Considerations

1. **JWT Tokens**: Stored securely and expire after 7 days
2. **Password Hashing**: Bcryptjs with salt rounds for secure password storage
3. **Admin Authorization**: Role-based access control on sensitive endpoints
4. **Payment Verification**: HMAC-SHA256 signature validation to prevent tampering
5. **Stock Validation**: Prevents overselling through inventory checks before order creation

---

## Usage Flow

### Complete Purchase Flow

1. **User Registration**
   ```
   POST /api/auth/register → Get JWT token
   ```

2. **Browse Products**
   ```
   GET /api/products → View all products
   GET /api/products/:id → View product details
   ```

3. **Add Items to Cart**
   ```
   POST /api/cart/add → Add product to cart
   GET /api/cart → View cart
   ```

4. **Save Delivery Address**
   ```
   POST /api/addresses → Add delivery address
   GET /api/addresses → Get saved addresses
   ```

5. **Create Order**
   ```
   POST /api/orders → Convert cart to order
   ```

6. **Process Payment**
   ```
   POST /api/payment/create-order → Create Razorpay order
   POST /api/payment/verify → Verify payment and initiate shipment
   ```

---

## Support & Troubleshooting

- Ensure all required environment variables are set
- Check MongoDB connection before starting the server
- Verify JWT tokens are sent in the correct format: `Authorization: Bearer <token>`
- For payment issues, verify Razorpay credentials
- Monitor server logs for detailed error information

---

## License

ISC

---

## Version

1.0.0
