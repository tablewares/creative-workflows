export async function createAiAction(
  db,
  {
    projectId,
    aiUserId,
    actionType,
    prompt,
    resultText
  }
) {
  const result = await db.query(
    `
    INSERT INTO ai_actions (
      project_id,
      ai_user_id,
      action_type,
      prompt,
      result
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      projectId,
      aiUserId,
      actionType,
      prompt,
      resultText
    ]
  );

  return result.rows[0];
}

export async function getProjectAiActions(
  db,
  projectId
) {
  const result = await db.query(
    `
    SELECT
      a.*,
      u.name AS ai_name
    FROM ai_actions a
    JOIN users u
      ON u.id = a.ai_user_id
    WHERE a.project_id = $1
    ORDER BY a.created_at DESC
    `,
    [projectId]
  );

  return result.rows;
}