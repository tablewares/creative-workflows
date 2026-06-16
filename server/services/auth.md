# Auth API Service

A RESTful authentication API service built with Express.js and PostgreSQL.

## Features

- Create new users
- Retrieve user by ID
- List all users
- PostgreSQL database integration
- Error handling and validation
- CORS support

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydatabaseissocool
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
```

3. Ensure your PostgreSQL database has a `users` table with the following schema:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### 1. Create User
**POST** `/api/auth/users`

Create a new user in the database.

**Request Body:**
```json
{
  "name": "John Doe",
  "type": "admin"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "type": "admin",
    "created_at": "2026-06-16T03:51:50.958Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required fields",
  "message": "Both name and type are required"
}
```

### 2. Get User by ID
**GET** `/api/auth/users/:id`

Retrieve a specific user by their ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "type": "admin",
    "created_at": "2026-06-16T03:51:50.958Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found",
  "message": "No user found with ID 1"
}
```

### 3. List All Users
**GET** `/api/auth/users`

Retrieve all users, ordered by creation date (newest first).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Jane Smith",
      "type": "user",
      "created_at": "2026-06-16T04:00:00.000Z"
    },
    {
      "id": 1,
      "name": "John Doe",
      "type": "admin",
      "created_at": "2026-06-16T03:51:50.958Z"
    }
  ],
  "count": 2
}
```

### 4. Health Check
**GET** `/health`

Check if the server is running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-16T03:51:50.958Z"
}
```

### 5. Root Endpoint
**GET** `/`

Get API information and available endpoints.

**Response (200 OK):**
```json
{
  "message": "Auth API Server",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "createUser": "POST /api/auth/users",
    "getUser": "GET /api/auth/users/:id",
    "listUsers": "GET /api/auth/users"
  }
}
```

## Testing with cURL

### Create a user:
```bash
curl -X POST http://localhost:3000/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","type":"admin"}'
```

### Get a user by ID:
```bash
curl http://localhost:3000/api/auth/users/1
```

### List all users:
```bash
curl http://localhost:3000/api/auth/users
```

## Project Structure

```
.
├── server/
│   ├── server.js              # Main Express server
│   ├── db/
│   │   └── users.js           # Database queries for users
│   └── services/
│       └── auth_router.js     # Auth API routes
├── .env                       # Environment variables
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies
└── README.md                  # This file
```

## Error Handling

All endpoints include comprehensive error handling:
- **400 Bad Request**: Invalid input or missing required fields
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Database or server errors

## Security Notes

- This is a basic implementation. For production use, consider adding:
  - Authentication middleware (JWT, sessions, etc.)
  - Input sanitization
  - Rate limiting
  - HTTPS
  - Password hashing (if storing passwords)
  - SQL injection protection (already handled by parameterized queries)

## License

ISC
