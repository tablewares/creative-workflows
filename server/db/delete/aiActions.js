/**
 * Delete a specific AI action by ID
 */
export async function deleteAiAction(db, aiActionId) {
  const result = await db.query(
    `
    DELETE FROM ai_actions
    WHERE id = $1
    RETURNING *
    `,
    [aiActionId]
  );

  return result.rows[0];
}

/**
 * Delete all AI actions for a specific project
 */
export async function deleteProjectAiActions(db, projectId) {
  const result = await db.query(
    `
    DELETE FROM ai_actions
    WHERE project_id = $1
    RETURNING *
    `,
    [projectId]
  );

  return result.rows;
}

/**
 * Delete AI actions by AI user ID
 */
export async function deleteAiUserActions(db, aiUserId) {
  const result = await db.query(
    `
    DELETE FROM ai_actions
    WHERE ai_user_id = $1
    RETURNING *
    `,
    [aiUserId]
  );

  return result.rows;
}

// Made with Bob
