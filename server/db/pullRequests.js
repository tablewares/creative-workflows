export async function createPullRequest(
  db,
  {
    projectId,
    sourceBranchId,
    targetBranchId,
    authorId,
    title,
    description
  }
) {
  const result = await db.query(
    `
    INSERT INTO pull_requests (
      project_id,
      source_branch_id,
      target_branch_id,
      author_id,
      title,
      description
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      projectId,
      sourceBranchId,
      targetBranchId,
      authorId,
      title,
      description
    ]
  );

  return result.rows[0];
}

export async function getPullRequest(
  db,
  pullRequestId
) {
  const result = await db.query(
    `
    SELECT *
    FROM pull_requests
    WHERE id = $1
    `,
    [pullRequestId]
  );

  return result.rows[0];
}

export async function mergePullRequest(
  db,
  pullRequestId
) {
  const result = await db.query(
    `
    UPDATE pull_requests
    SET
      status = 'merged',
      merged_at = now()
    WHERE id = $1
    RETURNING *
    `,
    [pullRequestId]
  );

  return result.rows[0];
}