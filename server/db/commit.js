export async function createCommit(
  db,
  {
    projectId,
    parentCommitId,
    authorId,
    title,
    content
  }
) {
  const result = await db.query(
    `
    INSERT INTO commits (
      project_id,
      parent_commit_id,
      author_id,
      title,
      content
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      projectId,
      parentCommitId,
      authorId,
      title,
      content
    ]
  );

  return result.rows[0];
}

export async function getCommit(
  db,
  commitId
) {
  const result = await db.query(
    `
    SELECT *
    FROM commits
    WHERE id = $1
    `,
    [commitId]
  );

  return result.rows[0];
}

export async function getCommitHistory(
  db,
  projectId
) {
  const result = await db.query(
    `
    SELECT
      c.*,
      u.name AS author_name
    FROM commits c
    JOIN users u
      ON u.id = c.author_id
    WHERE c.project_id = $1
    ORDER BY c.created_at DESC
    `,
    [projectId]
  );

  return result.rows;
}