import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { Pool } from 'pg';

import {
  createUser
} from './users.js';

import {
  createProject
} from './project.js';

import {
  createBranch,
  getBranch
} from './branches.js';

import {
  createCommit,
  getCommitHistory
} from './commit.js';

import {
  addCommitToBranch
} from './branchCommits.js';

import {
  createPullRequest
} from './pullRequests.js';

import {
  createReview
} from './review.js';

import {
  createAiAction
} from './aiActions.js';

const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME
});


async function run() {

  try {
    console.log('\n--- CONNECTED ---\n');

    // USERS

    const alice = await createUser(db, {
      name: 'Alice',
      type: 'human'
    });

    const gpt = await createUser(db, {
      name: 'GPT-5 Contributor',
      type: 'ai'
    });

    console.log('Alice:', alice.id);
    console.log('AI:', gpt.id);

    // PROJECT

    const project = await createProject(db, {
      name: 'Hackathon Startup',
      description:
        'AI-assisted startup ideation',
      createdBy: alice.id
    });

    console.log('\nProject Created');
    console.log(project);

    // INITIAL COMMIT

    const initialCommit = await createCommit(db, {
      projectId: project.id,
      parentCommitId: null,
      authorId: alice.id,
      title: 'Initial concept',
      content:
        'AI tool that summarizes meetings'
    });

    console.log('\nInitial Commit');
    console.log(initialCommit);

    // MAIN BRANCH

    const mainBranch = await createBranch(db, {
      projectId: project.id,
      name: 'main',
      headCommitId: initialCommit.id,
      createdBy: alice.id
    });

    await addCommitToBranch(
      db,
      mainBranch.id,
      initialCommit.id
    );

    console.log('\nMain Branch');
    console.log(mainBranch);

    // AI BRANCH

    const aiBranch = await createBranch(db, {
      projectId: project.id,
      name: 'education-market',
      headCommitId: initialCommit.id,
      createdBy: gpt.id
    });

    await addCommitToBranch(
      db,
      aiBranch.id,
      initialCommit.id
    );

    console.log('\nAI Branch');
    console.log(aiBranch);

    // AI COMMIT

    const aiCommit = await createCommit(db, {
      projectId: project.id,
      parentCommitId: initialCommit.id,
      authorId: gpt.id,
      title: 'School market strategy',
      content:
        'Target schools with meeting summaries for teachers.'
    });

    await addCommitToBranch(
      db,
      aiBranch.id,
      aiCommit.id
    );

    console.log('\nAI Commit');
    console.log(aiCommit);

    // AI ACTION LOG

    const aiAction = await createAiAction(db, {
      projectId: project.id,
      aiUserId: gpt.id,
      actionType: 'commit_suggestion',
      prompt:
        'Suggest a customer segment',
      resultText:
        'Focus on K-12 schools'
    });

    console.log('\nAI Action');
    console.log(aiAction);

    // PULL REQUEST

    const pr = await createPullRequest(db, {
      projectId: project.id,
      sourceBranchId: aiBranch.id,
      targetBranchId: mainBranch.id,
      authorId: gpt.id,
      title:
        'Add education market strategy',
      description:
        'Merge AI-generated education ideas'
    });

    console.log('\nPull Request');
    console.log(pr);

    // REVIEW

    const review = await createReview(db, {
      pullRequestId: pr.id,
      reviewerId: gpt.id,
      status: 'approved',
      comment:
        'Education market has strong potential.'
    });

    console.log('\nReview');
    console.log(review);

    // HISTORY

    const history =
      await getCommitHistory(
        db,
        project.id
      );

    console.log('\nCommit History');
    console.table(
      history.map(c => ({
        title: c.title,
        author: c.author_name,
        created: c.created_at
      }))
    );

    const latestMain =
      await getBranch(
        db,
        mainBranch.id
      );

    console.log(
      '\nMain Branch Head:',
      latestMain.head_commit_id
    );

    console.log(
      '\nALL TESTS COMPLETED SUCCESSFULLY\n'
    );
  } catch (err) {
    console.error(
      '\nTEST FAILED\n'
    );
    console.error(err);
  } finally {
    await db.end();
  }
}

run();