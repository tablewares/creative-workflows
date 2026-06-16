/**
 * Delete a specific review by ID
 */
export async function deleteReview(db, reviewId) {
  const result = await db.query(
    `
    DELETE FROM reviews
    WHERE id = $1
    RETURNING *
    `,
    [reviewId]
  );

  return result.rows[0];
}

/**
 * Delete all reviews for a specific pull request
 */
export async function deletePullRequestReviews(db, pullRequestId) {
  const result = await db.query(
    `
    DELETE FROM reviews
    WHERE pull_request_id = $1
    RETURNING *
    `,
    [pullRequestId]
  );

  return result.rows;
}

/**
 * Delete all reviews by a specific reviewer
 */
export async function deleteReviewerReviews(db, reviewerId) {
  const result = await db.query(
    `
    DELETE FROM reviews
    WHERE reviewer_id = $1
    RETURNING *
    `,
    [reviewerId]
  );

  return result.rows;
}

/**
 * Delete reviews by status for a specific pull request
 */
export async function deleteReviewsByStatus(db, pullRequestId, status) {
  const result = await db.query(
    `
    DELETE FROM reviews
    WHERE pull_request_id = $1
      AND status = $2
    RETURNING *
    `,
    [pullRequestId, status]
  );

  return result.rows;
}

// Made with Bob
