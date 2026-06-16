import express from 'express';

import {
    removeCommitFromBranch,
    clearBranchCommits,
    deleteCommitFromAllBranches
} from '../../db/delete/branchCommits.js';

const router = express.Router();

// Remove a specific commit from a branch
router.delete('/branches/:branchId/commits/:commitId', async (req, res) => {
    try {
        const branchCommit = await removeCommitFromBranch(
            req.db,
            req.params.branchId,
            req.params.commitId
        );

        if (!branchCommit) {
            return res.status(404).json({
                error: 'Branch-commit association not found'
            });
        }

        res.json({
            message: 'Commit removed from branch successfully',
            deleted: branchCommit
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Clear all commits from a specific branch
router.delete('/branches/:branchId/commits', async (req, res) => {
    try {
        const branchCommits = await clearBranchCommits(
            req.db,
            req.params.branchId
        );

        res.json({
            message: 'Branch commits cleared successfully',
            deleted: branchCommits,
            count: branchCommits.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete all branch associations for a specific commit
router.delete('/commits/:commitId/branches', async (req, res) => {
    try {
        const branchCommits = await deleteCommitFromAllBranches(
            req.db,
            req.params.commitId
        );

        res.json({
            message: 'Commit removed from all branches successfully',
            deleted: branchCommits,
            count: branchCommits.length
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
