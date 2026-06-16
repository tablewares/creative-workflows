import express from 'express';

import {
    deleteReview,
    deletePullRequestReviews,
    deleteReviewerReviews,
    deleteReviewsByStatus
} from '../../db/delete/reviews.js';

const router = express.Router();

// Delete a specific review by ID
router.delete('/reviews/:reviewId', async (req, res) => {
    try {
        const review = await deleteReview(
            req.db,
            req.params.reviewId
        );

        if (!review) {
            return res.status(404).json({
                error: 'Review not found'
            });
        }

        res.json({
            message: 'Review deleted successfully',
            deleted: review
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete all reviews for a specific pull request
router.delete('/pull-requests/:pullRequestId/reviews', async (req, res) => {
    try {
        const reviews = await deletePullRequestReviews(
            req.db,
            req.params.pullRequestId
        );

        res.json({
            message: 'Pull request reviews deleted successfully',
            deleted: reviews,
            count: reviews.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete all reviews by a specific reviewer
router.delete('/reviewers/:reviewerId/reviews', async (req, res) => {
    try {
        const reviews = await deleteReviewerReviews(
            req.db,
            req.params.reviewerId
        );

        res.json({
            message: 'Reviewer reviews deleted successfully',
            deleted: reviews,
            count: reviews.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete reviews by status for a specific pull request
router.delete('/pull-requests/:pullRequestId/reviews/status/:status', async (req, res) => {
    try {
        const reviews = await deleteReviewsByStatus(
            req.db,
            req.params.pullRequestId,
            req.params.status
        );

        res.json({
            message: `Reviews with status '${req.params.status}' deleted successfully`,
            deleted: reviews,
            count: reviews.length
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
