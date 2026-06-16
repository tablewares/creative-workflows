/**
 * Delete a specific user by ID
 * Note: This may cascade delete related records if foreign keys are set up with ON DELETE CASCADE
 * Consider the implications of deleting users who have created projects, commits, etc.
 */
export async function deleteUser(db, userId) {
  const result = await db.query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, name, type
    `,
    [userId]
  );

  return result.rows[0];
}

/**
 * Delete a user by name
 */
export async function deleteUserByName(db, name) {
  const result = await db.query(
    `
    DELETE FROM users
    WHERE name = $1
    RETURNING id, name, type
    `,
    [name]
  );

  return result.rows[0];
}

/**
 * Delete users by type (e.g., 'human', 'ai')
 */
export async function deleteUsersByType(db, type) {
  const result = await db.query(
    `
    DELETE FROM users
    WHERE type = $1
    RETURNING id, name, type
    `,
    [type]
  );

  return result.rows;
}

// Made with Bob
