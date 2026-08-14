# Clothing Brand API - Authentication Documentation

## Base URL
```
http://localhost:3000
```

## Overview

The API uses **JWT (JSON Web Token)** authentication. Protected routes require a valid Bearer token in the Authorization header.

---

## 🔐 Authentication Endpoints

### 1. Register User
Create a new user account and send OTP to email.

**Endpoint:** `POST /auth/register`

**Access:** Public (No token required)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Check your email for OTP.",
  "data": {
    "email": "user@example.com",
    "message": "Verification code sent. Valid for 10 minutes."
  }
}
```

**Error Response:**
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

### 2. Verify Email (Confirm OTP)
Verify user's email address using the OTP sent to their email.

**Endpoint:** `POST /auth/verify-email`

**Access:** Public (No token required)

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "email": "user@example.com",
    "isEmailVerified": true
  }
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid OTP. Please try again.",
  "error": "Bad Request"
}
```

---

### 3. Resend OTP
Request a new OTP if the previous one expired.

**Endpoint:** `POST /auth/resend-otp`

**Access:** Public (No token required)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "New OTP sent to your email",
  "data": {
    "email": "user@example.com"
  }
}
```

---

### 4. Login (Email & Password)
Login with email and password to get JWT access token.

**Endpoint:** `POST /auth/login`

**Access:** Public (No token required)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTFmNjM2ZjYzNjU2YzZl...",
    "user": {
      "id": "651f636f63656c6e",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "role": "user",
      "createdAt": "2024-08-12T10:30:00Z"
    }
  }
}
```

**Error Response:**
```json
{
  "statusCode": 401,
  "message": "Please verify your email before logging in",
  "error": "Unauthorized"
}
```

**Account Lock Response (after 5 failed attempts):**
```json
{
  "statusCode": 401,
  "message": "Too many failed attempts. Account locked for 15 minutes.",
  "error": "Unauthorized"
}
```

---

### 5. Google OAuth Login
Login using Google account.

**Endpoint:** `GET /auth/google`

**Access:** Public (No token required)

**Description:** Redirects to Google OAuth consent screen

---

### 6. Google OAuth Callback
Google OAuth callback endpoint.

**Endpoint:** `GET /auth/google/callback`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651f636f63656c6e",
      "email": "user@gmail.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "role": "user",
      "createdAt": "2024-08-12T10:35:00Z"
    }
  }
}
```

---

### 7. Get User Profile
Retrieve the current authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Access:** Protected (Requires JWT token)

**Headers:**
```
Authorization: Bearer <ACCESS_TOKEN>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "_id": "651f636f63656c6e",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": true,
    "isActive": true,
    "role": "user",
    "createdAt": "2024-08-12T10:30:00Z",
    "updatedAt": "2024-08-12T10:31:00Z"
  }
}
```

---

### 8. Logout
Logout the current user (clears client-side token).

**Endpoint:** `POST /auth/logout`

**Access:** Protected (Requires JWT token)

**Headers:**
```
Authorization: Bearer <ACCESS_TOKEN>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## 📋 Authentication Flow

### Registration & Email Verification Flow
```
1. POST /auth/register
   ├─ Validate input (email, password, name)
   ├─ Hash password
   ├─ Generate 6-digit OTP
   ├─ Save user with hashed OTP (expires in 10 minutes)
   ├─ Send OTP to email
   └─ Return success message

2. POST /auth/verify-email
   ├─ Find user by email
   ├─ Check if OTP is expired
   ├─ Verify OTP hash
   ├─ Mark email as verified
   ├─ Send welcome email
   └─ Return success message
```

### Login Flow
```
1. POST /auth/login
   ├─ Find user by email
   ├─ Check if account is locked
   ├─ Check if email is verified
   ├─ Verify password
   ├─ Reset failed login attempts
   ├─ Generate JWT token
   └─ Return token and user data
```

### Protected Route Access Flow
```
1. Request to protected endpoint
   ├─ Extract token from Authorization header
   ├─ Verify JWT signature and expiration
   ├─ Extract user ID from token
   ├─ Process request
   └─ Return response
```

---

## 🔑 Using the Access Token

All protected endpoints require the access token in the Authorization header:

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Or in JavaScript/Fetch:
```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

fetch('http://localhost:3000/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## ⏱️ Token Details

- **Type:** Bearer JWT
- **Expiration:** 7 days (configurable via `JWT_EXPIRATION` in .env)
- **Signature Algorithm:** HS256
- **Contains:** User ID, email, role

---

## 🚨 Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid/expired token or credentials |
| 409 | Conflict | User already exists |
| 500 | Internal Server Error | Server error |

---

## 🧪 Testing with Postman

1. **Register:**
   - POST `http://localhost:3000/auth/register`
   - Body (JSON): email, password, firstName, lastName
   - Check console/email for OTP

2. **Verify Email:**
   - POST `http://localhost:3000/auth/verify-email`
   - Body (JSON): email, otp

3. **Login:**
   - POST `http://localhost:3000/auth/login`
   - Body (JSON): email, password
   - Copy the `accessToken` from response

4. **Get Profile:**
   - GET `http://localhost:3000/auth/profile`
   - Headers: `Authorization: Bearer <TOKEN>`

---

## 📝 OTP Configuration

- **OTP Length:** 6 digits
- **Expiration Time:** 10 minutes
- **Max Login Attempts:** 5 failed attempts
- **Account Lock Time:** 15 minutes after 5 failed attempts

---

## 🔐 Security Features

✅ Password hashing with bcrypt
✅ OTP hashing (not stored as plain text)
✅ JWT token-based authentication
✅ Account lockout after 5 failed login attempts
✅ Email verification requirement
✅ Google OAuth integration
✅ Automatic token expiration
✅ Protected routes with middleware

---

## 📧 Email Templates

### OTP Email
- Professional HTML template
- Displays 6-digit OTP
- Shows expiration time
- Warning for security

### Welcome Email
- Confirmation of verified email
- Instructions to start using the app
- Support contact information

---

## 🔄 Refresh Token (Future Enhancement)

Currently, the API uses only access tokens. In the future, we can implement:
- Refresh token for extended sessions
- Automatic token refresh before expiration
- Logout with token revocation
