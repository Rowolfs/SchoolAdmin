// backend/routers/teacher.router.ts
const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/teacher.controller');

// GET /api/teachers
router.get('/', TeacherController.viewAllTeachers);

// GET /api/teachers/user/:userId
router.get('/user/:userId', TeacherController.viewTeacherByUserId);

// DELETE /api/teachers/user/:userId
router.delete('/user/:userId', TeacherController.deleteTeacher);

// PATCH /api/teachers/user/:userId/restore
router.patch('/user/:userId/restore', TeacherController.restoreTeacher);

module.exports = router;
