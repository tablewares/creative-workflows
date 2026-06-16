export async function createReview(
  db,
  {
    pullRequestId,
    reviewerId,
    status,
    comment
  }
) {
  const result = await db.query(
    `
    INSERT INTO reviews (
      pull_request_id,
      reviewer_id,
      status,
      comment
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      pullRequestId,
      reviewerId,
      status,
      comment
    ]
  );

  return result.rows[0];
}

export async function getPullRequestReviews(
  db,
  pullRequestId
) {
  const result = await db.query(
    `
    SELECT
      r.*,
      u.name AS reviewer_name
    FROM reviews r
    JOIN users u
      ON u.id = r.reviewer_id
    WHERE r.pull_request_id = $1
    ORDER BY r.created_at ASC
    `,
    [pullRequestId]
  );

  return result.rows;
}