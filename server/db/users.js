export async function createUser(db, { name, type }) {
  const result = await db.query(
    `
    INSERT INTO users (name, type)
    VALUES ($1, $2)
    RETURNING *
    `,
    [name, type]
  );

  return result.rows[0];
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