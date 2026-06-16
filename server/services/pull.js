import express from 'express';

import { getBranchCommits } from '../db/branchCommits.js';


const router = express.Router();

// GET /api/pull/:branchId

router.get('/pull/:branchId', async (req, res) => {

    try {

        const commits = await getBranchCommits(
            req.db,
            req.params.branchId
        );

        res.json({

            count: commits.length,

            commits

        });

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

export default router;