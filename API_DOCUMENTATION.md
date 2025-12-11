# API Documentation

## Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Most API endpoints require authentication via JWT token. The token should be included in one of two ways:

1. **Cookie** (Recommended): `token` cookie set by login endpoint
2. **Authorization Header**: `Authorization: Bearer <token>`

### Protected Routes
- `/api/urls/*` - URL management endpoints
- `/api/stats/*` - Analytics endpoints
- `/api/referrals/*` - Referral management endpoints

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `400` - Validation error or email already exists
- `500` - Server error

---

### Login
Authenticate a user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `500` - Server error

---

### Logout
Invalidate the current session.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Current User
Get the currently authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Forgot Password
Request a password reset token.

**Endpoint:** `POST /api/auth/password/forgot`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent",
  "resetToken": "abc123..." // Only in development
}
```

---

### Reset Password
Reset password using the token from email.

**Endpoint:** `POST /api/auth/password/reset`

**Request Body:**
```json
{
  "resetToken": "abc123...",
  "newPassword": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Google OAuth
Authenticate using Google OAuth.

**Endpoint:** `POST /api/auth/google`

**Request Body:**
```json
{
  "credential": "google_oauth_credential_token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## URL Shortening Endpoints

### Shorten URL
Create a new shortened URL.

**Endpoint:** `POST /api/shorten`

**Authentication:** Optional (URLs created without auth are anonymous)

**Request Body:**
```json
{
  "url": "https://example.com/very-long-url",
  "customId": "mylink", // Optional
  "expiresIn": 30 // Optional, days from now
}
```

**Response:** `200 OK`
```json
{
  "shortId": "abc12345",
  "shortUrl": "http://localhost:3000/abc12345",
  "originalUrl": "https://example.com/very-long-url",
  "expireAt": "2024-02-01T00:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid URL or custom ID already in use
- `500` - Server error

---

### Redirect to Original URL
Redirect to the original URL and track analytics.

**Endpoint:** `GET /[shortId]`

**Example:** `GET /abc12345`

**Response:** `302 Redirect`
- Redirects to original URL
- Records visit analytics (IP, device, location, etc.)

**Errors:**
- `404` - URL not found or expired
- `403` - URL is suspended

---

## URL Management Endpoints

### Get User URLs
Get all URLs created by the authenticated user.

**Endpoint:** `GET /api/urls/user`

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "urls": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "originalUrl": "https://example.com/long-url",
      "shortId": "abc12345",
      "shortUrl": "http://localhost:3000/abc12345",
      "totalClicks": 42,
      "isSuspended": false,
      "allowReferrals": true,
      "expireAt": "2024-02-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

---

### Delete URL
Delete a shortened URL.

**Endpoint:** `DELETE /api/urls/delete`

**Authentication:** Required

**Request Body:**
```json
{
  "urlId": "507f1f77bcf86cd799439011"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "URL deleted successfully"
}
```

**Errors:**
- `404` - URL not found
- `403` - Not authorized to delete this URL

---

### Suspend URL
Temporarily disable a URL without deleting it.

**Endpoint:** `POST /api/urls/suspend`

**Authentication:** Required

**Request Body:**
```json
{
  "urlId": "507f1f77bcf86cd799439011",
  "suspend": true // or false to unsuspend
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "URL suspended successfully",
  "url": {
    "_id": "507f1f77bcf86cd799439011",
    "isSuspended": true
  }
}
```

---

### Extend URL Expiration
Extend the expiration date of a URL.

**Endpoint:** `POST /api/urls/extend`

**Authentication:** Required

**Request Body:**
```json
{
  "urlId": "507f1f77bcf86cd799439011",
  "additionalDays": 30
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "URL expiration extended",
  "newExpireAt": "2024-03-01T00:00:00.000Z"
}
```

---

### Rename URL
Update the custom alias of a URL.

**Endpoint:** `POST /api/urls/rename`

**Authentication:** Required

**Request Body:**
```json
{
  "urlId": "507f1f77bcf86cd799439011",
  "newShortId": "mynewlink"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "URL renamed successfully",
  "url": {
    "shortId": "mynewlink",
    "shortUrl": "http://localhost:3000/mynewlink"
  }
}
```

**Errors:**
- `400` - New short ID already in use

---

### Edit Original URL Name
Update a custom display name for the original URL.

**Endpoint:** `POST /api/urls/editOriginalName`

**Authentication:** Required

**Request Body:**
```json
{
  "urlId": "507f1f77bcf86cd799439011",
  "newName": "My Marketing Campaign"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "URL name updated"
}
```

---

### Toggle Referral Permissions
Enable or disable referral creation for a URL.

**Endpoint:** `POST /api/urls/allowReferrals`

**Authentication:** Required

**Request Body:**
```json
{
  "urlId": "507f1f77bcf86cd799439011",
  "allow": true // or false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Referral permissions updated",
  "allowReferrals": true
}
```

---

### Sync Guest URLs
Sync URLs created as guest to user account.

**Endpoint:** `POST /api/urls/sync`

**Authentication:** Required

**Request Body:**
```json
{
  "urls": [
    {
      "shortId": "abc12345",
      "originalUrl": "https://example.com/url1",
      "savedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "URLs synced successfully",
  "syncedCount": 5
}
```

---

## Analytics Endpoints

### Get URL Statistics
Get detailed analytics for a specific shortened URL.

**Endpoint:** `GET /api/stats/[shortId]`

**Authentication:** Required (must be URL owner)

**Example:** `GET /api/stats/abc12345`

**Response:** `200 OK`
```json
{
  "success": true,
  "url": {
    "_id": "507f1f77bcf86cd799439011",
    "originalUrl": "https://example.com/long-url",
    "shortId": "abc12345",
    "totalClicks": 1234,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "analytics": {
    "totalVisits": 1234,
    "uniqueVisitors": 856,
    "deviceBreakdown": {
      "mobile": 45,
      "desktop": 40,
      "tablet": 15
    },
    "browserBreakdown": {
      "Chrome": 60,
      "Safari": 25,
      "Firefox": 10,
      "Other": 5
    },
    "topCountries": [
      { "country": "United States", "count": 500 },
      { "country": "United Kingdom", "count": 200 }
    ],
    "topCities": [
      { "city": "New York", "count": 150 },
      { "city": "London", "count": 100 }
    ],
    "clicksOverTime": [
      { "date": "2024-01-01", "clicks": 50 },
      { "date": "2024-01-02", "clicks": 75 }
    ]
  },
  "recentVisits": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "country": "United States",
      "city": "New York",
      "device": "mobile",
      "browser": "Chrome",
      "os": "iOS"
    }
  ]
}
```

---

## Referral Endpoints

### Create Referral Link
Create a referral link for an existing shortened URL.

**Endpoint:** `POST /api/referral`

**Authentication:** Required

**Request Body:**
```json
{
  "originalUrlId": "507f1f77bcf86cd799439011",
  "referralName": "John's Referral",
  "referralEmail": "referral@example.com",
  "referralPassword": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "referralUrl": {
    "shortId": "ref12345",
    "shortUrl": "http://localhost:3000/ref12345",
    "originalUrlId": "507f1f77bcf86cd799439011"
  },
  "referralUser": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "referral@example.com"
  }
}
```

**Errors:**
- `403` - Original URL does not allow referrals
- `400` - Referral email already exists

---

### Get My Referrals
Get all referral links created by the authenticated user.

**Endpoint:** `GET /api/referrals/my`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "referrals": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "shortId": "ref12345",
      "shortUrl": "http://localhost:3000/ref12345",
      "originalUrlId": "507f1f77bcf86cd799439011",
      "totalClicks": 25,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Request Referral Partnership
Request permission to create a referral link.

**Endpoint:** `POST /api/referrals/request`

**Authentication:** Required

**Request Body:**
```json
{
  "urlId": "507f1f77bcf86cd799439011",
  "message": "I'd like to promote your link"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "request": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "pending"
  }
}
```

---

### Get Pending Referral Requests
Get all pending referral requests for user's URLs.

**Endpoint:** `GET /api/referrals/pending`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "urlId": "507f1f77bcf86cd799439011",
      "requesterId": "507f1f77bcf86cd799439015",
      "message": "I'd like to promote your link",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Update Referral Request Status
Approve or reject a referral request.

**Endpoint:** `PATCH /api/referrals/status/[requestId]`

**Authentication:** Required

**Request Body:**
```json
{
  "status": "approved" // or "rejected"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Request approved",
  "request": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "approved"
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

> **Note:** Rate limiting is not currently implemented but is recommended for production.

**Recommended Limits:**
- Anonymous users: 10 requests per minute
- Authenticated users: 100 requests per minute
- URL shortening: 20 requests per hour per user

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (default varies by endpoint)
- `order`: Sort order (`asc` or `desc`)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "limit": 10
  }
}
```

---

## Webhooks (Future Feature)

Webhook support is planned for future releases to notify external systems of events:

- `url.created` - New URL shortened
- `url.clicked` - URL was clicked
- `url.expired` - URL expired
- `referral.created` - New referral link created

---

## SDK & Client Libraries

Currently, no official SDKs are available. The API can be consumed using any HTTP client:

**JavaScript/TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3000/api/shorten', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    url: 'https://example.com/long-url',
    customId: 'mylink'
  })
});

const data = await response.json();
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url":"https://example.com/long-url","customId":"mylink"}'
```

---

## API Versioning

Currently, the API is unversioned. Future versions will use URL-based versioning:

- `v1`: `/api/v1/shorten`
- `v2`: `/api/v2/shorten`

---

## Support

For API support or questions:
- Email: api-support@urltrim.com
- Documentation: [https://docs.urltrim.com](https://docs.urltrim.com)
- GitHub Issues: [https://github.com/your-repo/issues](https://github.com/your-repo/issues)
