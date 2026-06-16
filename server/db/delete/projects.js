/**
 * Delete a specific project by ID
 * Note: This will cascade delete related records if foreign keys are set up with ON DELETE CASCADE
 */
export async function deleteProject(db, projectId) {
  const result = await db.query(
    `
    DELETE FROM projects
    WHERE id = $1
    RETURNING *
    `,
    [projectId]
  );

  return result.rows[0];
}

/**
 * Delete projects by creator
 */
export async function deleteUserProjects(db, userId) {
  const result = await db.query(
    `
    DELETE FROM projects
    WHERE created_by = $1
    RETURNING *
    `,
    [userId]
  );

  return result.rows;
}

/**
 * Delete a project by name
 */
export async function deleteProjectByName(db, name) {
  const result = await db.query(
    `
    DELETE FROM projects
    WHERE name = $1
    RETURNING *
    `,
    [name]
  );

  return result.rows[0];
}

// Made with Bob
