# CampusMart V2 - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Application

The application is already running:
- **Frontend:** http://localhost:5173
- **API Server:** http://localhost:5000

### 2. Create an Account

1. Open http://localhost:5173 in your browser
2. Click the "Login" button in the top right corner
3. Click "Sign Up" tab in the modal
4. Fill in the registration form:
   - Email: your-email@example.com
   - Username: your_username
   - Password: your_password
   - Phone: 0712345678 (optional)
   - Campus: Main Campus (optional)
5. Click "Sign Up"
6. You'll be automatically logged in!

### 3. Explore Features

Once logged in, you can:

#### Browse Products
- View trending products on the home page
- Browse by category (Books, Electronics, Fashion, etc.)
- Search for specific items
- Filter by campus and price

#### Sell Products
- Click "Sell" button
- Fill in product details
- Upload images
- Set price and stock
- Publish your listing

#### Shopping
- Add items to cart
- Add items to wishlist
- Checkout and place orders
- Track your orders

#### Find Rooms
- Browse available rooms
- Filter by type and campus
- View room details and amenities
- Contact landlords

#### Order Food
- Browse food vendors
- View menus
- Place food orders
- Track delivery

## 📱 Features Overview

### Marketplace
- Buy and sell products
- Multiple categories
- Product search and filters
- Product images and descriptions
- Stock management
- Seller ratings

### Authentication
- User registration
- Secure login
- JWT token authentication
- Profile management
- Password protection

### Shopping Cart
- Add/remove items
- Update quantities
- Checkout process
- Order history

### Wishlist
- Save favorite items
- Quick access to saved products
- Easy add/remove

### Room Rentals
- Browse available rooms
- Detailed room information
- Amenities list
- Landlord contact info

### Food Ordering
- Multiple vendors
- Menu browsing
- Category filters
- Delivery information

## 🔧 Current Status

### ✅ Working Features
- User registration and login
- Product browsing with mock data
- Category filtering
- Search functionality
- Responsive UI
- Authentication system
- API endpoints

### ⚠️ Mock Mode
The application is currently running in mock mode (without PostgreSQL):
- Sample products are displayed
- User registration works with in-memory storage
- All features are functional
- Data resets when server restarts

### 🔄 To Enable Full Database Mode
1. Install PostgreSQL
2. Create database: `createdb -U postgres campusmart`
3. Update credentials in `.env` file
4. Push schema: `cd lib/db && pnpm run push`
5. Restart the server

## 🎯 Quick Actions

### Test User Registration
```bash
# Using cURL
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test@example.com",
    "password": "password123"
  }'
```

### Check API Health
```bash
curl http://localhost:5000/api/health
```

## 📚 Documentation

- **README.md** - Full project documentation
- **AUTH_GUIDE.md** - Authentication system details
- **API Endpoints** - See README.md for complete API reference

## 🐛 Troubleshooting

### Frontend shows "Connection Issue"
- Ensure API server is running on port 5000
- Check browser console for errors
- Verify VITE_API_URL in .env file

### Cannot register/login
- Check API server logs for errors
- Verify request payload is correct
- Try using cURL to test API directly

### Products not loading
- API is using mock data (this is normal)
- Check browser network tab for API calls
- Verify API returns data: `curl http://localhost:5000/api/products`

## 💡 Tips

1. **Development Mode:** The app is in development mode with hot reload
2. **Mock Data:** Sample products are pre-loaded for testing
3. **Token Storage:** Auth tokens are stored in localStorage
4. **Auto-Login:** After registration, you're automatically logged in
5. **Session Persistence:** Your login persists across page refreshes

## 🎉 You're All Set!

The application is ready to use. Start by creating an account and exploring the features!

**Happy Shopping! 🛍️**
