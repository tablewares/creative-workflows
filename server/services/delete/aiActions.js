import express from 'express';

import {
    deleteAiAction,
    deleteProjectAiActions,
    deleteAiUserActions
} from '../../db/delete/aiActions.js';

const router = express.Router();

// Delete a specific AI action by ID
router.delete('/ai-actions/:aiActionId', async (req, res) => {
    try {
        const aiAction = await deleteAiAction(
            req.db,
            req.params.aiActionId
        );

        if (!aiAction) {
            return res.status(404).json({
                error: 'AI action not found'
            });
        }

        res.json({
            message: 'AI action deleted successfully',
            deleted: aiAction
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete all AI actions for a specific project
router.delete('/projects/:projectId/ai-actions', async (req, res) => {
    try {
        const aiActions = await deleteProjectAiActions(
            req.db,
            req.params.projectId
        );

        res.json({
            message: 'Project AI actions deleted successfully',
            deleted: aiActions,
            count: aiActions.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete all AI actions by a specific AI user
router.delete('/ai-users/:aiUserId/actions', async (req, res) => {
    try {
        const aiActions = await deleteAiUserActions(
            req.db,
            req.params.aiUserId
        );

        res.json({
            message: 'AI user actions deleted successfully',
            deleted: aiActions,
            count: aiActions.length
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
