import express from 'express';

import {

    createBranch,

    getBranch,

    getBranchByName

} from '../db/branches.js';

import {

    getBranchCommits

} from '../db/branchCommits.js';


const router = express.Router();

// Create Branch

router.post('/branches', async (req, res) => {

    try {

        const branch = await createBranch(req.db, {

            projectId: req.body.projectId,

            name: req.body.name,

            headCommitId: req.body.headCommitId,

            createdBy: req.body.createdBy

        });

        res.status(201).json(branch);

    } catch (err) {

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

});

// Get Branch

router.get('/branches/:branchId', async (req, res) => {

    try {

        const branch = await getBranch(

            req.db,

            req.params.branchId

        );

        if (!branch) {

            return res.status(404).json({

                error: 'Branch not found'

            });

        }

        res.json(branch);

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// Lookup by name

router.get('/project/:projectId/:name', async (req, res) => {

    try {

        const branch = await getBranchByName(

            req.db,

            req.params.projectId,

            req.params.name

        );

        if (!branch) {

            return res.status(404).json({

                error: 'Branch not found'

            });

        }

        res.json(branch);

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// Branch History

router.get('/:branchId/commits', async (req, res) => {

    try {

        const commits = await getBranchCommits(

            req.db,

            req.params.branchId

        );

        res.json(commits);

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

export default router;  