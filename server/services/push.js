import express from 'express';

import { commitToBranch } from '../db/actions/committing.js';


const router = express.Router();

// POST /api/push
router.post('/push', async (req, res) => {

    try {

        const commit = await commitToBranch(req.db, {

            projectId: req.body.projectId,

            branchId: req.body.branchId,

            authorId: req.body.authorId,

            title: req.body.title,

            content: req.body.content

        });

        res.json({

            message: 'Push successful',

            commit

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});


export default router;
