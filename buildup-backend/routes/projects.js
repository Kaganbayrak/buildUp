// routes/projects.js
import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// Proje ekle
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tüm projeleri getir
router.get('/', async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

export default router;