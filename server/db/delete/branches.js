/**
 * Delete a specific branch by ID
 */
export async function deleteBranch(db, branchId) {
  const result = await db.query(
    `
    DELETE FROM branches
    WHERE id = $1
    RETURNING *
    `,
    [branchId]
  );

  return result.rows[0];
}

/**
 * Delete a branch by name within a project
 */
export async function deleteBranchByName(db, projectId, name) {
  const result = await db.query(
    `
    DELETE FROM branches
    WHERE project_id = $1
      AND name = $2
    RETURNING *
    `,
    [projectId, name]
  );

  return result.rows[0];
}

/**
 * Delete all branches for a specific project
 */
export async function deleteProjectBranches(db, projectId) {
  const result = await db.query(
    `
    DELETE FROM branches
    WHERE project_id = $1
    RETURNING *
    `,
    [projectId]
  );

  return result.rows;
}

// Made with Bob
