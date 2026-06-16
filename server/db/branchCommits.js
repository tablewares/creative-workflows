export async function addCommitToBranch(
  db,
  branchId,
  commitId
) {
  await db.query(
    `
    INSERT INTO branch_commits (
      branch_id,
      commit_id
    )
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [branchId, commitId]
  );
}

export async function getBranchCommits(
  db,
  branchId
) {
  const result = await db.query(
    `
    SELECT c.*
    FROM commits c
    JOIN branch_commits bc
      ON bc.commit_id = c.id
    WHERE bc.branch_id = $1
    ORDER BY c.created_at DESC
    `,
    [branchId]
  );

  return result.rows;
}