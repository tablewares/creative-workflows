import { getBranch, updateBranchHead} from "../branches.js";
import { createCommit } from "../commit.js";
import { addCommitToBranch } from "../branchCommits.js";

export async function commitToBranch(
  db,
  {
    projectId,
    branchId,
    authorId,
    title,
    content
  }
) {
  // 🔍 Toggleable Debug Helper
  const logDebug = (...args) => {
    if (process.env.DEBUG_AUTH === 'true') { // Using your existing toggle variable
      console.log(`[COMMIT-DEBUG] [${new Date().toISOString()}]`, ...args);
    }
  };

  logDebug(`Starting commit process on branch: ${branchId} for project: ${projectId}`);
  
  await db.query('BEGIN');
  logDebug('Transaction initialized (BEGIN)');

  try {
    logDebug(`Fetching branch details for branchId: ${branchId}`);
    const branch = await getBranch(db, branchId);
    logDebug(`Found branch. Current head_commit_id is: ${branch.head_commit_id}`);

    logDebug(`Creating new commit object titled: "${title}"`);
    const commit = await createCommit(db, {
      projectId,
      parentCommitId: branch.head_commit_id,
      authorId,
      title,
      content
    });
    logDebug(`Commit object successfully created with ID: ${commit.id}`);

    logDebug(`Linking commit ${commit.id} history to branch ${branchId}`);
    await addCommitToBranch(
      db,
      branchId,
      commit.id
    );

    logDebug(`Moving HEAD pointer of branch ${branchId} to new commit ${commit.id}`);
    await updateBranchHead(
      db,
      branchId,
      commit.id
    );

    await db.query('COMMIT');
    logDebug(`Transaction successfully applied (COMMIT). New HEAD is finalized.`);

    return commit;
  } catch (err) {
    logDebug(`CRITICAL: Commit failed inside transaction. Execution halted. Error: ${err.message || err}`);
    
    await db.query('ROLLBACK');
    logDebug('Transaction successfully reverted (ROLLBACK). Database state untouched.');
    
    throw err;
  }
}