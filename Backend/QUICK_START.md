# 🚀 Quick Start Guide - Authentication System

## ✅ System Ready!

Your complete authentication system is now set up and compiled. Here's how to start testing it.

---

## 🏃 Starting the Server

```bash
npm run start:dev
```

You should see:
```
✓ Application is running on: http://localhost:3000
✓ OTP email service configured in development mode (console logging)
📧 Swagger API docs available at: http://localhost:3000/api
```

---

## 🧪 Testing Workflow

### Step 1️⃣: Register a User
Register a new account. OTP will be printed to console.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Check your email for OTP.",
  "data": {
    "email": "test@example.com",
    "message": "Verification code sent. Valid for 10 minutes."
  }
}
```

**Console Output (Development):**
```
📧 OTP Email (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: test@example.com
Subject: Email Verification - OTP
OTP: 123456
Expires in: 10 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 2️⃣: Verify Email with OTP
Use the OTP from console to verify the email.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "email": "test@example.com",
    "isEmailVerified": true
  }
}
```

**Console Output:**
```
📧 Welcome Email (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: test@example.com
Subject: Welcome to Clothing Brand
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 3️⃣: Login to Get Access Token
Now login with verified email to get JWT token.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTFmNjM2ZjYzNjU2YzZlIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2OTIwNTQzMjEsImV4cCI6MTY5MjY1OTEyMX0.abc123xyz...",
    "user": {
      "id": "651f636f63656c6e",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "role": "user",
      "createdAt": "2024-08-12T10:30:00.000Z"
    }
  }
}
```

💾 **Copy the `accessToken` - you'll need it for protected routes!**

---

### Step 4️⃣: Access Protected Route
Use the access token to get your profile.

**Request:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "_id": "651f636f63656c6e",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": true,
    "isActive": true,
    "role": "user",
    "createdAt": "2024-08-12T10:30:00.000Z",
    "updatedAt": "2024-08-12T10:31:00.000Z"
  }
}
```

---

## 🎯 Available Endpoints

### Public Endpoints (No Auth Required)
```
POST   /auth/register         - Create account
POST   /auth/verify-email     - Verify email with OTP
POST   /auth/resend-otp       - Request new OTP
POST   /auth/login            - Login & get token
GET    /auth/google           - Google OAuth
GET    /auth/google/callback  - Google callback
GET    /                      - Welcome message
GET    /health                - Health check
```

### Protected Endpoints (Require Valid Token)
```
GET    /auth/profile          - Get user profile
POST   /auth/logout           - Logout
```

---

## 📊 API Documentation

View interactive Swagger docs:
```
http://localhost:3000/api
```

Try requests directly from the browser UI!

---

## 🔑 Token Usage

Include token in all protected requests:

**cURL:**
```bash
curl -H "Authorization: Bearer <YOUR_TOKEN_HERE>" http://localhost:3000/auth/profile
```

**JavaScript/Fetch:**
```javascript
const token = "eyJhbGciOiJIUzI1NiIs...";

fetch('http://localhost:3000/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

**Postman:**
1. Go to the request's "Authorization" tab
2. Select "Bearer Token" from dropdown
3. Paste your token in the token field
4. Send request

---

## 📧 Email Setup (Optional)

For production email sending (currently logs to console):

1. Go to: https://myaccount.google.com/apppasswords
2. Generate an App Password
3. Add to `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

4. Restart server: `npm run start:dev`

---

## 🚨 Common Test Scenarios

### Scenario 1: Try Login Without Email Verification
```bash
# Register without verifying email, then try to login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Response:** 401 - "Please verify your email before logging in"

---

### Scenario 2: Try Invalid Password (Account Lockout)
```bash
# Try wrong password 5 times
for i in {1..5}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
done
```

**After 5 attempts:** Account locked for 15 minutes

---

### Scenario 3: Try with Expired OTP
```bash
# Wait 11 minutes (OTP expires in 10 min), then try to verify
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

**Response:** 400 - "OTP has expired. Please request a new one."

---

### Scenario 4: Resend OTP
```bash
# Request new OTP if the first one expired
curl -X POST http://localhost:3000/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Response:** New OTP sent and printed to console

---

## 🔍 Debug Mode

View all API calls and responses in Swagger:
```
http://localhost:3000/api
```

Monitor the console for:
- ✅ Successful operations
- ❌ Error messages
- 📧 Email templates (development mode)
- 🔐 Token generation

---

## 📝 Database

Data is stored in MongoDB:
```
Connection: mongodb://localhost:27017/clothing-brand
Collection: users
```

To view data:
```bash
# Using MongoDB CLI
mongosh "mongodb://localhost:27017/clothing-brand"
db.users.find()
```

---

## 🎓 Next Steps

1. ✅ Test all endpoints above
2. ✅ Setup Gmail credentials (optional)
3. ✅ Create Frontend to consume these APIs
4. ✅ Add Product endpoints
5. ✅ Add Cart/Order endpoints
6. ✅ Deploy to production

---

## 💡 Tips

- **Development:** Emails logged to console, no Gmail setup needed
- **Testing:** Use Postman or curl for quick testing
- **Token:** Tokens expire in 7 days (check `.env`)
- **Password:** Minimum 6 characters
- **OTP:** 6 digits, expires in 10 minutes
- **Account Lock:** 15 minutes after 5 failed login attempts

---

## ⚠️ Important Notes

- 🔐 Never commit `.env` file to git (already in `.gitignore`)
- 🚀 Update `JWT_SECRET` for production
- 📧 Add real email credentials for production
- 🔒 Use HTTPS in production
- 📱 Implement frontend logout to clear token

---

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env to 3001 or another available port
PORT=3001
npm run start:dev
```

**MongoDB connection error:**
```bash
# Make sure MongoDB is running
mongod
```

**Email not configured:**
```bash
# Check console for "⚠️ Email service configured in development mode"
# This is normal - emails logged to console instead of sent
```

---

Enjoy building! 🎉
