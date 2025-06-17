// backend/routers/class.router.ts
const express = require('express');
const {
  viewClasses,
  viewClassById,
  createClass,
  updateClass,
  deleteClass,
  assignStudents,
  assignDiscipline, // добавили
  viewDisciplineTeacherPairs,
  searchDisciplineTeacherPairs,
  assignDisciplineTeacherPairs,
} = require('../controllers/class.controller');
const { verifyToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Все роуты доступны только авторизованным пользователям
router.use(verifyToken);

// 1. Просмотр списка классов (ADMIN и TEACHER)
router.get('/', authorize(['ADMIN', 'TEACHER']), viewClasses);

// 2. Просмотр конкретного класса по ID (ADMIN и TEACHER)
router.get('/:id', authorize(['ADMIN', 'TEACHER']), viewClassById);

// 3. Создание нового класса (только ADMIN)
router.post('/', authorize(['ADMIN']), createClass);

// 4. Обновление класса (только ADMIN)
router.patch('/:id', authorize(['ADMIN']), updateClass);

// 5. Soft-delete класса (только ADMIN)
router.delete('/:id', authorize(['ADMIN']), deleteClass);

// 6. Назначение учеников в класс (ADMIN и TEACHER)
router.post('/:id/students', authorize(['ADMIN', 'TEACHER']), assignStudents);


// GET /api/classes/:id/discipline-teachers
router.get('/:id/discipline-teachers', viewDisciplineTeacherPairs);

// GET /api/classes/:id/discipline-teachers/search
router.get('/:id/discipline-teachers/search', searchDisciplineTeacherPairs);

// PUT /api/classes/:id/discipline-teachers
router.put('/:id/discipline-teachers', assignDisciplineTeacherPairs);

module.exports = router;
