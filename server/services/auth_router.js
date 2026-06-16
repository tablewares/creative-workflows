import express from 'express';
import { createUser, getUserById, listUsers, authenticateUser } from '../db/users.js';

const router = express.Router();

  // POST /api/auth/register (Stays the same)
    const logDebug = (...args) => {
    if (process.env.DEBUG_AUTH === 'true') {
      console.log(`[AUTH-DEBUG] [${new Date().toISOString()}]`, ...args);
    }
  };

  // POST /api/auth/register
  router.post('/register', async (req, res) => {
    logDebug('Registration attempt received:', { name: req.body.name, type: req.body.type });
    
    try {
      const { name, type, password } = req.body;
      if (!name || !type || !password) {
        logDebug('Registration failed: Missing required fields');
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Note: Kept your req.db format as provided in your snippet
      const newUser = await createUser(req.db || db, { name, type, password });
      
      logDebug('User successfully created:', { id: newUser.id, name: newUser.name });
      return res.status(201).json({ message: "User registered!", user: newUser });
    } catch (error) {
      logDebug('Registration encountered an error:', error.message || error);
      
      if (error.code === '23505') {
        logDebug(`Registration conflict: Username "${req.body.name}" already exists`);
        return res.status(409).json({ error: "Username taken" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    logDebug('Login attempt received for user:', req.body.name);
    logDebug('Session middleware check:', { hasSession: !!req.session });
    try {
      const { name, password } = req.body;
      if (!name || !password) {
        logDebug('Login failed: Missing name or password payload');
        return res.status(400).json({ error: "Missing name or password" });
      }

      const result = await authenticateUser(req.db || db, { name, password });
      if (!result.success) {
        logDebug(`Authentication rejected for user: ${name} - Reason: ${result.message || 'Invalid credentials'}`);
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // CREATE THE SESSION HERE
      req.session.user = {
        id: result.user.id,
        name: result.user.name,
        type: result.user.type
      };

      logDebug('Session established successfully:', { 
        sessionId: req.sessionID, 
        user: req.session.user 
      });

      return res.status(200).json({
        message: "Login successful!",
        user: req.session.user
      });
    } catch (error) {
      console.error("Login error:", error);
      logDebug('Critical login crash occurred:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/auth/logout
  router.post('/logout', (req, res) => {
    if (req.session && req.session.user) {
      logDebug(`Logging out user: ${req.session.user.name} (Session ID: ${req.sessionID})`);
    } else {
      logDebug('Logout hit, but no active session was found on the request');
    }

    req.session.destroy((err) => {
      if (err) {
        logDebug('Failed to destroy session on the server:', err);
        return res.status(500).json({ error: "Could not log out" });
      }
      
      logDebug('Session destroyed on server. Clearing client cookie...');
      res.clearCookie('connect.sid'); 
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

/**
 * GET /api/auth/users/:id
 * Get a user by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number'
      });
    }

    const user = await getUserById(req.db, userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `No user found with ID ${userId}`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(404).json({
      error: 'Internal server error',
      message: 'Failed to fetch user'
    });
  }
});

/**
 * GET /api/auth/users
 * List all users
 */


export default router;

// Made with Bob
