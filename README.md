# CampusMart V2 - Campus Marketplace Platform

A comprehensive campus marketplace platform built with Express.js, React, and PostgreSQL. Features include product marketplace, food ordering, room rentals, and user authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.11+
- pnpm
- PostgreSQL

### Installation

```bash
# Install dependencies
pnpm install

# Create database
createdb -U postgres campusmart

# Push database schema
cd lib/db
pnpm run push
cd ../..

# Start development servers
pnpm run dev
```

Access the application at:
- Frontend: http://localhost:5173
- API: http://localhost:5001

## 📁 Project Structure

```
CampusMart-V2/
├── artifacts/
│   ├── api-server/          # Express API backend
│   │   └── src/
│   │       ├── routes/      # API endpoints
│   │       ├── lib/         # Utilities
│   │       ├── middlewares/ # Express middlewares
│   │       ├── app.ts       # Express app setup
│   │       └── index.ts     # Server entry point
│   └── campusmart/          # React frontend
├── lib/
│   ├── db/                  # Database schemas & migrations
│   ├── api-zod/             # Validation schemas
│   └── api-client-react/    # React API client
└── package.json             # Workspace config
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filters)
- `POST /api/products` - Create product (auth required)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)
- `GET /api/products/seller/:sellerId` - Get seller's products

### Cart
- `GET /api/cart` - Get user's cart (auth required)
- `POST /api/cart/add` - Add item to cart (auth required)
- `PUT /api/cart/:id` - Update cart item quantity (auth required)
- `DELETE /api/cart/:id` - Remove item from cart (auth required)
- `DELETE /api/cart` - Clear cart (auth required)

### Orders
- `GET /api/orders` - Get user's orders (auth required)
- `GET /api/orders/:id` - Get order details (auth required)
- `POST /api/orders/checkout` - Create order from cart (auth required)
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order (auth required)

### Wishlist & Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/wishlist` - Get user's wishlist (auth required)
- `POST /api/categories/wishlist/add` - Add to wishlist (auth required)
- `DELETE /api/categories/wishlist/:productId` - Remove from wishlist (auth required)

### Rooms
- `GET /api/rooms` - Get all room listings (with filters)
- `POST /api/rooms` - Create room listing (auth required)
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room listing (auth required)
- `DELETE /api/rooms/:id` - Delete room listing (auth required)
- `GET /api/rooms/landlord/:landlordId` - Get landlord's rooms

### Food
- `GET /api/food/vendors` - Get all food vendors (with filters)
- `GET /api/food/vendors/:id` - Get vendor details
- `POST /api/food/vendors` - Create food vendor (auth required)
- `GET /api/food/items/vendor/:vendorId` - Get vendor's food items
- `POST /api/food/items` - Create food item (auth required)
- `PUT /api/food/items/:id` - Update food item (auth required)
- `DELETE /api/food/items/:id` - Delete food item (auth required)

### Users
- `GET /api/users/profile` - Get user profile (auth required)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile (auth required)
- `POST /api/users/change-password` - Change password (auth required)
- `GET /api/users/stats/seller` - Get seller stats (auth required)
- `GET /api/users/search/:query` - Search users

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email
- `phone` - Unique phone number
- `username` - Unique username
- `passwordHash` - Hashed password
- `campus` - Campus name
- `avatarUrl` - Profile picture URL
- `role` - User role (student/admin)
- `createdAt` - Creation timestamp

### Products Table
- `id` - Primary key
- `sellerId` - Foreign key to users
- `title` - Product title
- `description` - Product description
- `price` - Current price
- `originalPrice` - Original price (for discounts)
- `category` - Product category
- `condition` - Item condition (new/like_new/good/fair)
- `campus` - Campus location
- `images` - Array of image URLs
- `stock` - Available quantity
- `status` - Product status (active/sold/paused)
- `badge` - Badge type (HOT/NEW/SALE)
- `featured` - Featured flag
- `createdAt` - Creation timestamp

### Cart Items Table
- `id` - Primary key
- `userId` - Foreign key to users
- `productId` - Foreign key to products
- `quantity` - Item quantity
- `createdAt` - Creation timestamp

### Wishlist Table
- `id` - Primary key
- `userId` - Foreign key to users
- `productId` - Foreign key to products
- `createdAt` - Creation timestamp

### Orders Table
- `id` - Primary key
- `orderId` - Unique order ID
- `buyerId` - Foreign key to users
- `items` - JSON array of order items
- `totalAmount` - Total order amount
- `status` - Order status (pending/confirmed/shipped/delivered/cancelled)
- `deliveryAddress` - Delivery address
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Rooms Table
- `id` - Primary key
- `landlordId` - Foreign key to users
- `title` - Room title
- `description` - Room description
- `type` - Room type (bedsitter/single/one_bedroom/two_bedroom/hostel)
- `monthlyRent` - Monthly rent amount
- `campus` - Campus location
- `distanceToCampus` - Distance to campus
- `images` - Array of image URLs
- `amenities` - Array of amenities
- `available` - Availability flag
- `landlordPhone` - Landlord phone number
- `createdAt` - Creation timestamp

### Food Vendors Table
- `id` - Primary key
- `name` - Vendor name
- `campus` - Campus location
- `bannerImage` - Banner image URL
- `rating` - Vendor rating
- `deliveryTime` - Estimated delivery time
- `minOrder` - Minimum order amount
- `categories` - Array of food categories
- `isOpen` - Open/closed status
- `createdAt` - Creation timestamp

### Food Items Table
- `id` - Primary key
- `vendorId` - Foreign key to food vendors
- `name` - Item name
- `description` - Item description
- `price` - Item price
- `image` - Item image URL
- `category` - Food category
- `available` - Availability flag
- `createdAt` - Creation timestamp

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are valid for 7 days.

## 🛠️ Available Scripts

### Root Level
```bash
pnpm run dev          # Start both API and frontend
pnpm run build        # Build all packages
pnpm run typecheck    # Type check all packages
```

### API Server
```bash
cd artifacts/api-server
pnpm run dev          # Build and start in dev mode
pnpm run build        # Build for production
pnpm run start        # Start the built server
```

### Frontend
```bash
cd artifacts/campusmart
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run serve        # Preview production build
```

### Database
```bash
cd lib/db
pnpm run push         # Push schema to database
pnpm run push-force   # Force push schema
```

## 📝 Features

### Marketplace
- Browse and search products by category, campus, and price
- Create and manage product listings
- Product images and detailed descriptions
- Stock management
- Product badges (NEW, SALE, HOT)

### Shopping
- Add items to cart
- Manage cart quantities
- Wishlist functionality
- Checkout and order creation
- Order tracking and status updates

### Room Rentals
- Browse available rooms
- Filter by type, campus, and price
- Detailed room information with amenities
- Landlord contact information

### Food Ordering
- Browse food vendors by campus
- View vendor menus
- Filter by category and rating
- Delivery time and minimum order info

### User Management
- User registration and authentication
- Profile management
- Password change
- User search functionality

## 🔄 Environment Variables

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campusmart

# API Server
PORT=5001
NODE_ENV=development
JWT_SECRET=campusmart-secret-2024-dev

# Frontend
VITE_API_URL=http://localhost:5001
```

## 📦 Dependencies

### Backend
- Express.js - Web framework
- Drizzle ORM - Database ORM
- PostgreSQL - Database
- JWT - Authentication
- Pino - Logging
- CORS - Cross-origin requests

### Frontend
- React - UI framework
- Vite - Build tool
- TypeScript - Type safety
- Shadcn/ui - UI components

## 🚀 Deployment

### Build for Production
```bash
pnpm run build
```

### Start Production Server
```bash
cd artifacts/api-server
pnpm run start
```

## 📄 License

MIT

## 👥 Support

For issues and questions, please create an issue in the repository.
