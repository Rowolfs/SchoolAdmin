// backend/routers/student.router.js
const express = require('express');
const { viewStudents, viewStudentsByClass } = require('../controllers/student.controller');
const { verifyToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Любой запрос к /api/students требует авторизации
router.use(verifyToken);

// Получить всех студентов (ролям ADMIN и TEACHER)
router.get('/', authorize(['ADMIN', 'TEACHER']), viewStudents);

// Получить студентов по ID класса (ролям ADMIN и TEACHER)
router.get('/class/:classId', authorize(['ADMIN', 'TEACHER']), viewStudentsByClass);

module.exports = router;
