import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
let testUserId = null;

// Create a test database connection
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

describe('Auth API Routes', () => {
  before(async () => {
    console.log('Setting up tests...');
    // Clean up any test users before running tests
    await pool.query("DELETE FROM users WHERE name LIKE 'Test User%'");
  });

  after(async () => {
    console.log('Cleaning up tests...');
    // Clean up test data
    if (testUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await pool.query("DELETE FROM users WHERE name LIKE 'Test User%'");
    await pool.end();
  });

  describe('POST /api/auth/users', () => {
    it('should create a new user with valid data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User 1',
          type: 'admin',
        }),
      });

      const data = await response.json();

      assert.strictEqual(response.status, 201, 'Should return 201 status');
      assert.strictEqual(data.success, true, 'Should have success: true');
      assert.ok(data.data, 'Should have data object');
      assert.ok(data.data.id, 'Should have user id');
      assert.strictEqual(data.data.name, 'Test User 1', 'Should have correct name');
      assert.strictEqual(data.data.type, 'admin', 'Should have correct type');
      assert.ok(data.data.created_at, 'Should have created_at timestamp');

      // Save the test user ID for cleanup
      testUserId = data.data.id;
    });

    it('should return 400 when name is missing', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
        }),
      });

      const data = await response.json();

      assert.strictEqual(response.status, 400, 'Should return 400 status');
      assert.ok(data.error, 'Should have error message');
      assert.strictEqual(data.error, 'Missing required fields');
    });

    it('should return 400 when type is missing', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
        }),
      });

      const data = await response.json();

      assert.strictEqual(response.status, 400, 'Should return 400 status');
      assert.ok(data.error, 'Should have error message');
    });

    it('should return 400 when both fields are missing', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      assert.strictEqual(response.status, 400, 'Should return 400 status');
      assert.ok(data.error, 'Should have error message');
    });
  });

  describe('GET /api/auth/users/:id', () => {
    it('should get a user by valid ID', async () => {
      // First create a user to retrieve
      const createResponse = await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User 2',
          type: 'user',
        }),
      });

      const createData = await createResponse.json();
      const userId = createData.data.id;

      // Now retrieve the user
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`);
      const data = await response.json();

      assert.strictEqual(response.status, 200, 'Should return 200 status');
      assert.strictEqual(data.success, true, 'Should have success: true');
      assert.ok(data.data, 'Should have data object');
      assert.strictEqual(data.data.id, userId, 'Should have correct user id');
      assert.strictEqual(data.data.name, 'Test User 2', 'Should have correct name');
      assert.strictEqual(data.data.type, 'user', 'Should have correct type');

      // Cleanup
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('should return 404 for non-existent user ID', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/999999`);
      const data = await response.json();

      assert.strictEqual(response.status, 404, 'Should return 404 status');
      assert.ok(data.error, 'Should have error message');
      assert.strictEqual(data.error, 'User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/invalid`);
      const data = await response.json();

      assert.strictEqual(response.status, 400, 'Should return 400 status');
      assert.ok(data.error, 'Should have error message');
      assert.strictEqual(data.error, 'Invalid user ID');
    });
  });

  describe('GET /api/auth/users', () => {
    it('should list all users', async () => {
      // Create a few test users
      await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User 3',
          type: 'admin',
        }),
      });

      await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User 4',
          type: 'user',
        }),
      });

      // List all users
      const response = await fetch(`${API_BASE_URL}/api/auth/users`);
      const data = await response.json();

      assert.strictEqual(response.status, 200, 'Should return 200 status');
      assert.strictEqual(data.success, true, 'Should have success: true');
      assert.ok(Array.isArray(data.data), 'Should have data array');
      assert.ok(data.count >= 2, 'Should have at least 2 users');
      assert.strictEqual(data.count, data.data.length, 'Count should match array length');

      // Verify users are ordered by created_at DESC
      if (data.data.length > 1) {
        const firstDate = new Date(data.data[0].created_at);
        const secondDate = new Date(data.data[1].created_at);
        assert.ok(firstDate >= secondDate, 'Users should be ordered by created_at DESC');
      }
    });

    it('should return empty array when no users exist', async () => {
      // Clean up all test users
      await pool.query("DELETE FROM users WHERE name LIKE 'Test User%'");

      const response = await fetch(`${API_BASE_URL}/api/auth/users`);
      const data = await response.json();

      assert.strictEqual(response.status, 200, 'Should return 200 status');
      assert.strictEqual(data.success, true, 'Should have success: true');
      assert.ok(Array.isArray(data.data), 'Should have data array');
      assert.strictEqual(data.count, 0, 'Count should be 0');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();

      assert.strictEqual(response.status, 200, 'Should return 200 status');
      assert.strictEqual(data.status, 'ok', 'Should have status: ok');
      assert.ok(data.timestamp, 'Should have timestamp');
    });
  });

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.json();

      assert.strictEqual(response.status, 200, 'Should return 200 status');
      assert.strictEqual(data.message, 'Auth API Server', 'Should have correct message');
      assert.ok(data.version, 'Should have version');
      assert.ok(data.endpoints, 'Should have endpoints object');
      assert.ok(data.endpoints.createUser, 'Should have createUser endpoint');
      assert.ok(data.endpoints.getUser, 'Should have getUser endpoint');
      assert.ok(data.endpoints.listUsers, 'Should have listUsers endpoint');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await fetch(`${API_BASE_URL}/api/nonexistent`);
      const data = await response.json();

      assert.strictEqual(response.status, 404, 'Should return 404 status');
      assert.ok(data.error, 'Should have error message');
      assert.strictEqual(data.error, 'Not found');
    });
  });
});

// Made with Bob
