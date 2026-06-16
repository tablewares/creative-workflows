export async function createProject(
  db,
  { name, description, createdBy }
) {
  const result = await db.query(
    `
    INSERT INTO projects (
      name,
      description,
      created_by
    )
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [name, description, createdBy]
  );

  return result.rows[0];
}

export async function getProject(db, projectId) {
  const result = await db.query(
    `
    SELECT *
    FROM projects
    WHERE id = $1
    `,
    [projectId]
  );

  return result.rows[0];
}

export async function listProjects(db) {
  const result = await db.query(
    `
    SELECT *
    FROM projects
    ORDER BY created_at DESC
    `
  );

  return result.rows;
}