// backend/routers/discipline.router.ts
const express = require('express');
const DisciplineController = require('../controllers/discipline.controller');

const router = express.Router();

// GET /api/disciplines
router.get('/', DisciplineController.getAll);

// POST /api/disciplines
router.post('/', DisciplineController.create);

// DELETE /api/disciplines/:id
router.delete('/:id', DisciplineController.remove);

// GET /api/disciplines/:id/teachers
router.get('/:id/teachers', DisciplineController.getTeachers);

// PUT /api/disciplines/:id/teachers
router.put('/:id/teachers', DisciplineController.assignTeachers);

module.exports = router;
