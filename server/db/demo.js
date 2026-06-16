import { getBranch, updateBranchHead} from "./branches.js";
import { createCommit } from "./commit.js";
import { addCommitToBranch } from "./branchCommits.js";

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
  await db.query('BEGIN');

  try {
    const branch = await getBranch(db, branchId);

    const commit = await createCommit(db, {
      projectId,
      parentCommitId: branch.head_commit_id,
      authorId,
      title,
      content
    });

    await addCommitToBranch(
      db,
      branchId,
      commit.id
    );

    await updateBranchHead(
      db,
      branchId,
      commit.id
    );

    await db.query('COMMIT');

    return commit;
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}
