/**
 * Remove a specific commit from a branch
 */
export async function removeCommitFromBranch(db, branchId, commitId) {
  const result = await db.query(
    `
    DELETE FROM branch_commits
    WHERE branch_id = $1
      AND commit_id = $2
    RETURNING *
    `,
    [branchId, commitId]
  );

  return result.rows[0];
}

/**
 * Clear all commits from a specific branch
 */
export async function clearBranchCommits(db, branchId) {
  const result = await db.query(
    `
    DELETE FROM branch_commits
    WHERE branch_id = $1
    RETURNING *
    `,
    [branchId]
  );

  return result.rows;
}

/**
 * Delete all branch associations for a specific commit
 */
export async function deleteCommitFromAllBranches(db, commitId) {
  const result = await db.query(
    `
    DELETE FROM branch_commits
    WHERE commit_id = $1
    RETURNING *
    `,
    [commitId]
  );

  return result.rows;
}

// Made with Bob
