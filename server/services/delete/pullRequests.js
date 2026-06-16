import express from 'express';

import {
    deletePullRequest,
    deleteProjectPullRequests,
    deleteAuthorPullRequests,
    deleteBranchPullRequests,
    deletePullRequestsByStatus
} from '../../db/delete/pullRequests.js';

const router = express.Router();

// Delete a specific pull request by ID
router.delete('/pull-requests/:pullRequestId', async (req, res) => {
    try {
        const pullRequest = await deletePullRequest(
            req.db,
            req.params.pullRequestId
        );

        if (!pullRequest) {
            return res.status(404).json({
                error: 'Pull request not found'
            });
        }

        res.json({
            message: 'Pull request deleted successfully',
            deleted: pullRequest
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete all pull requests for a specific project
router.delete('/projects/:projectId/pull-requests', async (req, res) => {
    try {
        const pullRequests = await deleteProjectPullRequests(
            req.db,
            req.params.projectId
        );

        res.json({
            message: 'Project pull requests deleted successfully',
            deleted: pullRequests,
            count: pullRequests.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete pull requests by author
router.delete('/authors/:authorId/pull-requests', async (req, res) => {
    try {
        const pullRequests = await deleteAuthorPullRequests(
            req.db,
            req.params.authorId
        );

        res.json({
            message: 'Author pull requests deleted successfully',
            deleted: pullRequests,
            count: pullRequests.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete pull requests involving a specific branch
router.delete('/branches/:branchId/pull-requests', async (req, res) => {
    try {
        const pullRequests = await deleteBranchPullRequests(
            req.db,
            req.params.branchId
        );

        res.json({
            message: 'Branch pull requests deleted successfully',
            deleted: pullRequests,
            count: pullRequests.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete pull requests by status
router.delete('/projects/:projectId/pull-requests/status/:status', async (req, res) => {
    try {
        const pullRequests = await deletePullRequestsByStatus(
            req.db,
            req.params.projectId,
            req.params.status
        );

        res.json({
            message: `Pull requests with status '${req.params.status}' deleted successfully`,
            deleted: pullRequests,
            count: pullRequests.length
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
