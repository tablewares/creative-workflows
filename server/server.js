import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import authRouter from './services/auth_router.js';
import session from 'express-session';

import commitRouter from "./services/commit.js";
import pushRouter from "./services/push.js";
import pullRouter from "./services/pull.js";
import projectRouter from "./services/projects.js";
import branchesRouter from "./services/branches.js";

// Delete routers
import deleteAiActionsRouter from "./services/delete/aiActions.js";
import deleteBranchCommitsRouter from "./services/delete/branchCommits.js";
import deleteBranchesRouter from "./services/delete/branches.js";
import deleteCommitsRouter from "./services/delete/commits.js";
import deleteProjectsRouter from "./services/delete/projects.js";
import deletePullRequestsRouter from "./services/delete/pullRequests.js";
import deleteReviewsRouter from "./services/delete/reviews.js";
import deleteUsersRouter from "./services/delete/users.js";

// Load environment variables
dotenv.config({path: "../.env"});

const app = express();
const PORT = process.env.PORT || 3000;

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware

// Add database connection to request object
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// CORS middleware (optional, for development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Session middleware
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));


// Routes
app.use('/api/auth', authRouter);
app.use('/api', commitRouter)
app.use('/api', pullRouter)
app.use('/api', pushRouter)
app.use('/api', projectRouter)
app.use('/api', branchesRouter)

// Delete routes
app.use('/api/delete', deleteAiActionsRouter);
app.use('/api/delete', deleteBranchCommitsRouter);
app.use('/api/delete', deleteBranchesRouter);
app.use('/api/delete', deleteCommitsRouter);
app.use('/api/delete', deleteProjectsRouter);
app.use('/api/delete', deletePullRequestsRouter);
app.use('/api/delete', deleteReviewsRouter);
app.use('/api/delete', deleteUsersRouter);

app.get('/api/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  return res.json({ message: "Welcome to your profile!", user: req.session.user });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Auth API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      createUser: 'POST /api/auth/users',
      getUser: 'GET /api/auth/users/:id',
      listUsers: 'GET /api/auth/users'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

export default app;

// Made with Bob
