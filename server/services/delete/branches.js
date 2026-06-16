import express from 'express';

import {
    deleteBranch,
    deleteBranchByName,
    deleteProjectBranches
} from '../../db/delete/branches.js';

const router = express.Router();

// Delete a specific branch by ID
router.delete('/branches/:branchId', async (req, res) => {
    try {
        const branch = await deleteBranch(
            req.db,
            req.params.branchId
        );

        if (!branch) {
            return res.status(404).json({
                error: 'Branch not found'
            });
        }

        res.json({
            message: 'Branch deleted successfully',
            deleted: branch
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete a branch by name within a project
router.delete('/projects/:projectId/branches/:name', async (req, res) => {
    try {
        const branch = await deleteBranchByName(
            req.db,
            req.params.projectId,
            req.params.name
        );

        if (!branch) {
            return res.status(404).json({
                error: 'Branch not found'
            });
        }

        res.json({
            message: 'Branch deleted successfully',
            deleted: branch
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete all branches for a specific project
router.delete('/projects/:projectId/branches', async (req, res) => {
    try {
        const branches = await deleteProjectBranches(
            req.db,
            req.params.projectId
        );

        res.json({
            message: 'Project branches deleted successfully',
            deleted: branches,
            count: branches.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

export default router;

// Made with Bob
