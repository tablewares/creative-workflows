import bcrypt from 'bcrypt';

/**
 * 1. CREATE USER (Registration)
 * Hashes the plaintext password and stores it in the database.
 */
export async function createUser(db, { name, type, password }) {
  // The "10" is the cost factor (how many times it scrambles the password). 
  // Bcrypt automatically generates a unique salt behind the scenes here.
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await db.query(
    `
    INSERT INTO users (name, type, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, type; 
    `,
    [name, type, hashedPassword]
  );

  // Avoid returning the password_hash back to the client application
  return result.rows[0];
}

/**
 * 2. AUTHENTICATE USER (Login)
 * Looks up the user, extracts the salt from the stored hash, and compares it.
 */
export async function authenticateUser(db, { name, password }) {
  // Step A: Fetch the user and their stored hash by their unique identifier (name)
  const result = await db.query(
    `
    SELECT id, name, type, password_hash 
    FROM users 
    WHERE name = $1
    `,
    [name]
  );

  const user = result.rows[0];

  // If no user was found with that name, deny access
  if (!user) {
    return { success: false, message: "Invalid credentials" };
  }

  // Step B: Compare the incoming plaintext password with the stored hash.
  // Bcrypt reads the salt directly out of user.password_hash automatically!
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (isMatch) {
    // Password is correct! Return the user data (minus the hash)
    return {
      success: true,
      user: { id: user.id, name: user.name, type: user.type }
    };
  } else {
    // Password did not match
    return { success: false, message: "Invalid credentials" };
  }
}


export async function getUserById(db, userId) {
  const result = await db.query(
    `
    SELECT *
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0];
}

export async function listUsers(db) {
  const result = await db.query(
    `
    SELECT *
    FROM users
    ORDER BY created_at DESC
    `
  );
  return result.rows;
}
