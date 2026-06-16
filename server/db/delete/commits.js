/**
 * Delete a specific commit by ID
 */
export async function deleteCommit(db, commitId) {
  const result = await db.query(
    `
    DELETE FROM commits
    WHERE id = $1
    RETURNING *
    `,
    [commitId]
  );

  return result.rows[0];
}

/**
 * Delete all commits for a specific project
 */
export async function deleteProjectCommits(db, projectId) {
  const result = await db.query(
    `
    DELETE FROM commits
    WHERE project_id = $1
    RETURNING *
    `,
    [projectId]
  );

  return result.rows;
}

/**
 * Delete commits by author
 */
export async function deleteAuthorCommits(db, authorId) {
  const result = await db.query(
    `
    DELETE FROM commits
    WHERE author_id = $1
    RETURNING *
    `,
    [authorId]
  );

  return result.rows;
}

/**
 * Delete child commits of a specific parent commit
 */
export async function deleteChildCommits(db, parentCommitId) {
  const result = await db.query(
    `
    DELETE FROM commits
    WHERE parent_commit_id = $1
    RETURNING *
    `,
    [parentCommitId]
  );

  return result.rows;
}

// Made with Bob
