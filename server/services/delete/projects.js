import express from 'express';

import {
    deleteProject,
    deleteUserProjects,
    deleteProjectByName
} from '../../db/delete/projects.js';

const router = express.Router();

// Delete a specific project by ID
router.delete('/projects/:projectId', async (req, res) => {
    try {
        const project = await deleteProject(
            req.db,
            req.params.projectId
        );

        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        res.json({
            message: 'Project deleted successfully',
            deleted: project
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete projects by creator
router.delete('/users/:userId/projects', async (req, res) => {
    try {
        const projects = await deleteUserProjects(
            req.db,
            req.params.userId
        );

        res.json({
            message: 'User projects deleted successfully',
            deleted: projects,
            count: projects.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Delete a project by name
router.delete('/projects/by-name/:name', async (req, res) => {
    try {
        const project = await deleteProjectByName(
            req.db,
            req.params.name
        );

        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        res.json({
            message: 'Project deleted successfully',
            deleted: project
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
