// backend/routers/student.router.ts
const express = require('express');
const {
  viewStudents,
  viewStudentsByClass,
  searchStudents,
} = require('../controllers/student.controller');
const { verifyToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Все запросы к /api/students требуют авторизации
router.use(verifyToken);

// GET /api/students
// Только ADMIN и TEACHER могут получить список всех студентов
router.get('/', authorize(['ADMIN', 'TEACHER']), viewStudents);

// GET /api/students/class/:classId
// Только ADMIN и TEACHER могут получить студентов определённого класса
router.get(
  '/class/:classId',
  authorize(['ADMIN', 'TEACHER']),
  viewStudentsByClass
);

// GET /api/students/search?query=...
// Только ADMIN и TEACHER могут искать студентов
router.get(
  '/search',
  authorize(['ADMIN', 'TEACHER']),
  searchStudents
);

module.exports = router;
