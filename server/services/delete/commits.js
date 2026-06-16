import express from 'express';

import {
    deleteCommit,
    deleteProjectCommits,
    deleteAuthorCommits,
    deleteChildCommits
} from '../../db/delete/commits.js';

const router = express.Router();

// Delete a specific commit by ID
router.delete('/commits/:commitId', async (req, res) => {
    try {
        const commit = await deleteCommit(
            req.db,
            req.params.commitId
        );

        if (!commit) {
            return res.status(404).json({
                error: 'Commit not found'
            });
        }

        res.json({
            message: 'Commit deleted successfully',
            deleted: commit
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete all commits for a specific project
router.delete('/projects/:projectId/commits', async (req, res) => {
    try {
        const commits = await deleteProjectCommits(
            req.db,
            req.params.projectId
        );

        res.json({
            message: 'Project commits deleted successfully',
            deleted: commits,
            count: commits.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete commits by author
router.delete('/authors/:authorId/commits', async (req, res) => {
    try {
        const commits = await deleteAuthorCommits(
            req.db,
            req.params.authorId
        );

        res.json({
            message: 'Author commits deleted successfully',
            deleted: commits,
            count: commits.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete child commits of a specific parent commit
router.delete('/commits/:parentCommitId/children', async (req, res) => {
    try {
        const commits = await deleteChildCommits(
            req.db,
            req.params.parentCommitId
        );

        res.json({
            message: 'Child commits deleted successfully',
            deleted: commits,
            count: commits.length
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
