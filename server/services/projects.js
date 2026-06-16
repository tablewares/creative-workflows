import express from 'express';

import {
    createProject,
    getProject,
    listProjects
} from '../db/project.js';


const router = express.Router();

// Create Project
router.post('/projects', async (req, res) => {

    try {

        const project = await createProject(req.db, {
            name: req.body.name,
            description: req.body.description,
            createdBy: req.body.createdBy
        });

        res.status(201).json(project);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

});

// Get Project
router.get('/projects/:projectId', async (req, res) => {

    try {

        const project = await getProject(
            req.db,
            req.params.projectId
        );

        if (!project) {

            return res.status(404).json({
                error: 'Project not found'
            });

        }

        res.json(project);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

// List Projects

router.get('/projects/all', async (req, res) => {

    try {

        const projects =
            await listProjects(req.db);

        res.json(projects);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});
export default router;