import express from 'express';

import { commitToBranch } from '../db/actions/committing.js';
import { getCommitHistory } from '../db/commit.js';


const router = express.Router();

// POST /api/commits
router.post('/commits', async (req, res) => {

    try {

        const commit = await commitToBranch(req.db, {
            projectId: req.body.projectId,
            branchId: req.body.branchId,
            authorId: req.body.authorId,
            title: req.body.title,
            content: req.body.content
        });

        res.status(201).json(commit);

    } catch (err) {

        console.error(err);
        res.status(500).json({ error: err.message });

    }

});

// GET /api/commits/:projectId
router.get('/commits/:projectId', async (req, res) => {

    try {

        const commits = await getCommitHistory(
            req.db,
            req.params.projectId
        );

        res.json(commits);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

export default router;