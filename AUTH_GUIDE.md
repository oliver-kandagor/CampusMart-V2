# CampusMart V2 - Authentication Guide

## Overview

The authentication system is now fully integrated and working with both PostgreSQL (when available) and in-memory mock storage (fallback mode).

## Features

- User Registration
- User Login
- JWT Token Authentication
- Password Hashing (SHA-256)
- Token Expiration (7 days)
- Automatic fallback to mock storage when database is unavailable

## API Endpoints

### Register a New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "john@example.com",
  "username": "john_doe",
  "password": "securepassword123",
  "phone": "0712345678",
  "campus": "Main Campus"
}
```

**Response (Success - 201):**
```json
{
  "user": {
    "id": "abc123...",
    "email": "john@example.com",
    "username": "john_doe",
    "phone": "0712345678",
    "campus": "Main Campus",
    "avatarUrl": null,
    "role": "student",
    "createdAt": "2024-03-28T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error - 400):**
```json
{
  "error": "Email or username already exists"
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "emailOrPhone": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": "abc123...",
    "email": "john@example.com",
    "username": "john_doe",
    "phone": "0712345678",
    "campus": "Main Campus",
    "avatarUrl": null,
    "role": "student",
    "createdAt": "2024-03-28T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials"
}
```

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "id": "abc123...",
  "email": "john@example.com",
  "username": "john_doe",
  "phone": "0712345678",
  "campus": "Main Campus",
  "avatarUrl": null,
  "role": "student",
  "createdAt": "2024-03-28T10:00:00.000Z"
}
```

**Response (Error - 401):**
```json
{
  "error": "Unauthorized"
}
```

### Logout

**Endpoint:** `POST /api/auth/logout`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logged out"
}
```

## Frontend Integration

The frontend is already configured to work with the authentication system. Here's how it works:

### 1. Registration Flow

When a user fills out the registration form and submits:
1. Frontend sends POST request to `/api/auth/register`
2. Backend validates the data and creates the user
3. Backend returns user data and JWT token
4. Frontend stores the token in localStorage
5. Frontend updates the auth context with user data
6. User is automatically logged in

### 2. Login Flow

When a user fills out the login form and submits:
1. Frontend sends POST request to `/api/auth/login`
2. Backend validates credentials
3. Backend returns user data and JWT token
4. Frontend stores the token in localStorage
5. Frontend updates the auth context with user data
6. User is redirected to the home page

### 3. Protected Routes

For any authenticated requests:
1. Frontend automatically includes the token in the Authorization header
2. Backend validates the token
3. Backend extracts the user ID from the token
4. Backend processes the request with the authenticated user context

### 4. Token Storage

- Tokens are stored in `localStorage` with key `campusmart_token`
- Tokens are automatically included in all API requests
- Tokens expire after 7 days

## Testing Authentication

### Using the Frontend

1. Open http://localhost:5173
2. Click "Login" button in the top right
3. Switch to "Sign Up" tab
4. Fill in the registration form:
   - Email: test@example.com
   - Username: testuser
   - Password: password123
   - Phone: 0712345678
   - Campus: Main Campus
5. Click "Sign Up"
6. You should be automatically logged in

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "phone": "0712345678",
    "campus": "Main Campus"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-token-here>"
```

## Security Features

1. **Password Hashing:** Passwords are hashed using SHA-256 with a salt
2. **JWT Tokens:** Secure token-based authentication
3. **Token Expiration:** Tokens expire after 7 days
4. **CORS Protection:** CORS is configured to allow frontend access
5. **Authorization Headers:** All protected routes require valid JWT token

## Mock Mode

When PostgreSQL is not available, the system automatically falls back to in-memory storage:

- Users are stored in a Map data structure
- Data persists only during the server session
- All authentication features work identically
- Perfect for development and testing

## Troubleshooting

### "Invalid credentials" error
- Check that the email/phone and password are correct
- Ensure the user has been registered first

### "Unauthorized" error
- Check that the token is included in the Authorization header
- Ensure the token hasn't expired
- Try logging in again to get a fresh token

### "Email or username already exists"
- Try a different email or username
- If in mock mode, restart the server to clear the in-memory storage

### Connection errors
- Ensure the API server is running on port 5000
- Check that the frontend is configured to use http://localhost:5000
- Verify CORS is enabled in the API server

## Next Steps

1. Test the registration and login flows
2. Create test users
3. Explore the marketplace features
4. Start selling and buying products!

## Support

For issues or questions, check the main README.md or create an issue in the repository.
