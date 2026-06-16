/**
 * Delete a specific pull request by ID
 */
export async function deletePullRequest(db, pullRequestId) {
  const result = await db.query(
    `
    DELETE FROM pull_requests
    WHERE id = $1
    RETURNING *
    `,
    [pullRequestId]
  );

  return result.rows[0];
}

/**
 * Delete all pull requests for a specific project
 */
export async function deleteProjectPullRequests(db, projectId) {
  const result = await db.query(
    `
    DELETE FROM pull_requests
    WHERE project_id = $1
    RETURNING *
    `,
    [projectId]
  );

  return result.rows;
}

/**
 * Delete pull requests by author
 */
export async function deleteAuthorPullRequests(db, authorId) {
  const result = await db.query(
    `
    DELETE FROM pull_requests
    WHERE author_id = $1
    RETURNING *
    `,
    [authorId]
  );

  return result.rows;
}

/**
 * Delete pull requests involving a specific branch (source or target)
 */
export async function deleteBranchPullRequests(db, branchId) {
  const result = await db.query(
    `
    DELETE FROM pull_requests
    WHERE source_branch_id = $1
       OR target_branch_id = $1
    RETURNING *
    `,
    [branchId]
  );

  return result.rows;
}

/**
 * Delete pull requests by status
 */
export async function deletePullRequestsByStatus(db, projectId, status) {
  const result = await db.query(
    `
    DELETE FROM pull_requests
    WHERE project_id = $1
      AND status = $2
    RETURNING *
    `,
    [projectId, status]
  );

  return result.rows;
}

// Made with Bob
