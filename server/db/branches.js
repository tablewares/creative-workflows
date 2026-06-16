export async function createBranch(
  db,
  {
    projectId,
    name,
    headCommitId,
    createdBy
  }
) {
  const result = await db.query(
    `
    INSERT INTO branches (
      project_id,
      name,
      head_commit_id,
      created_by
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      projectId,
      name,
      headCommitId,
      createdBy
    ]
  );

  return result.rows[0];
}

export async function getBranch(db, branchId) {
  const result = await db.query(
    `
    SELECT *
    FROM branches
    WHERE id = $1
    `,
    [branchId]
  );

  return result.rows[0];
}

export async function getBranchByName(
  db,
  projectId,
  name
) {
  const result = await db.query(
    `
    SELECT *
    FROM branches
    WHERE project_id = $1
      AND name = $2
    `,
    [projectId, name]
  );

  return result.rows[0];
}

export async function updateBranchHead(
  db,
  branchId,
  commitId
) {
  const result = await db.query(
    `
    UPDATE branches
    SET head_commit_id = $2
    WHERE id = $1
    RETURNING *
    `,
    [branchId, commitId]
  );

  return result.rows[0];
}