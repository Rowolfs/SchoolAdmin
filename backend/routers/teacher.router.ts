// backend/routers/teacher.router.js
const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/teacher.controller');

// Получить всех активных преподавателей
// GET /api/teachers
router.get('/', TeacherController.viewAllTeachers);

// (Опционально) Получить преподавателя по userId
// GET /api/teachers/user/:userId
router.get('/user/:userId', TeacherController.viewTeacherByUserId);

// Soft-delete преподавателя по userId
// DELETE /api/teachers/user/:userId
router.delete('/user/:userId', TeacherController.deleteTeacher);

// Восстановить преподавателя по userId
// PATCH /api/teachers/user/:userId/restore
router.patch('/user/:userId/restore', TeacherController.restoreTeacher);

module.exports = router;
