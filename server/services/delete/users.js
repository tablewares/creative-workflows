import express from 'express';

import {
    deleteUser,
    deleteUserByName,
    deleteUsersByType
} from '../../db/delete/users.js';

const router = express.Router();

// Delete a specific user by ID
router.delete('/users/:userId', async (req, res) => {
    try {
        const user = await deleteUser(
            req.db,
            req.params.userId
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'User deleted successfully',
            deleted: user
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
