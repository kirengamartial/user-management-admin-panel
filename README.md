# Admin Panel - User Management System

A full-stack admin panel application built with React/Next.js frontend and Node.js/Express backend, featuring user management with cryptographic verification and analytics.

## Features

- **User Management (CRUD)**: Create, read, update, and delete users
- **Cryptographic Security**:
  - SHA-384 email hashing
  - RSA digital signatures for data integrity
  - Frontend signature verification
- **Protocol Buffers**: Efficient data serialization using Protobuf
- **Analytics Dashboard**: Graph showing users created per day (last 7 days)
- **SQLite Database**: Lightweight persistent storage

## Project Structure

```
admin-panel/
├── backend/
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (crypto)
│   │   ├── proto/         # Protobuf schema
│   │   ├── keys/          # RSA keypair (generated)
│   │   ├── scripts/       # Utility scripts
│   │   └── index.js       # Server entry point
│   ├── package.json
│   └── database.sqlite    # SQLite database (auto-created)
│
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/         # Next.js pages
    │   ├── services/      # API client
    │   ├── utils/         # Crypto utilities
    │   └── proto/         # Protobuf schema
    ├── public/
    │   └── proto/         # Public protobuf files
    ├── package.json
    └── next.config.js
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup & Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

Edit `.env` if needed. Available variables:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

4. Generate RSA keypair for signing:
```bash
npm run generate-keys
```

This will create `private.pem` and `public.pem` in the `src/keys/` directory.

5. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` if needed. Available variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001/api)

**Important:** The variable must start with `NEXT_PUBLIC_` to be accessible in the browser.

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

5. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

### Backend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `3001` | No |
| `NODE_ENV` | Environment mode | `development` | No |

**Example:**
```env
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/api` | No |

**Example:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Note:**
- Frontend variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- `.env.local` is used for local development and is ignored by git
- Never commit `.env` or `.env.local` files to version control

## API Endpoints

### User Management

- `POST /api/users` - Create a new user
  - Body: `{ email, role, status }`

- `GET /api/users` - Get all users

- `GET /api/users/:id` - Get user by ID

- `PUT /api/users/:id` - Update user
  - Body: `{ email, role, status }`

- `DELETE /api/users/:id` - Delete user

### Analytics

- `GET /api/users/stats` - Get users created per day (last 7 days)

### Protobuf Export

- `GET /api/users/export` - Export all users as protobuf binary
  - Returns: Binary data with UserList message

### Crypto

- `GET /api/users/public-key` - Get RSA public key for verification

## How It Works

### Cryptographic Security Flow

1. **User Creation**:
   - Backend hashes the email using SHA-384
   - Backend signs the hash with RSA private key
   - User data + hash + signature stored in database

2. **Data Export**:
   - Backend serializes users using Protocol Buffers
   - Sends binary data to frontend

3. **Frontend Verification**:
   - Frontend decodes Protobuf data
   - Frontend verifies each user's signature using public key
   - Only displays users with valid signatures

### Protocol Buffers Schema

```protobuf
message User {
  int32 id = 1;
  string email = 2;
  string role = 3;
  string status = 4;
  string createdAt = 5;
  string emailHash = 6;
  string signature = 7;
}

message UserList {
  repeated User users = 1;
  string publicKey = 2;
}
```

## Technologies Used

### Backend
- Node.js & Express
- better-sqlite3 (SQLite database)
- protobufjs (Protocol Buffers)
- Node.js crypto module (SHA-384, RSA)

### Frontend
- React 18
- Next.js 14
- protobufjs (Protocol Buffers decoding)
- recharts (Data visualization)
- Web Crypto API (Signature verification)
- axios (HTTP client)

## Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  emailHash TEXT NOT NULL,
  signature TEXT NOT NULL
)
```

## Security Notes

- RSA-2048 keypair is generated locally
- Private key never leaves the backend server
- Signatures are verified on the frontend using the public key
- SHA-384 is used for hashing (more secure than SHA-256)
- All user data is cryptographically signed for integrity

## Assumptions & Design Decisions

1. **Signature Algorithm**: Using RSA with SHA-384 (RSASSA-PKCS1-v1_5) for compatibility between Node.js crypto and Web Crypto API

2. **Database**: SQLite was chosen for simplicity and portability (no external database server needed)

3. **Verification**: Only users with valid signatures are displayed in the frontend table, ensuring data integrity

4. **Graph Data**: The last 7 days are always shown, with 0 counts for days without users

5. **API Port**: Backend runs on port 3001 to avoid conflicts with Next.js default port 3000

6. **CORS**: Enabled for local development (should be configured for production)

## Development Notes

- The backend must be running before starting the frontend
- RSA keys must be generated before the first run
- SQLite database is created automatically on first run
- All timestamps are stored in ISO 8601 format

## Future Enhancements

- Authentication & authorization
- Pagination for large user lists
- Export to CSV/JSON formats
- Advanced filtering and search
- User roles and permissions management
- Production-ready deployment configuration

## License

ISC

## Author

Admin Panel Development Team
