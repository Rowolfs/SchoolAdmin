// backend/routers/grade.router.ts

const express = require('express');
const {
  getDisciplinesAndClassesByTeacher,
  getPupilsByClass,
  getGrades,
  addOrUpdateGrade,
  softDeleteGrade,
} = require('../controllers/grade.controller');

const router = express.Router();

// Получить дисциплины+классы по учителю
router.get('/teacher-classes', getDisciplinesAndClassesByTeacher);

// Получить учеников по классу
router.get('/pupils', getPupilsByClass);

// Получить оценки
router.get('/', getGrades);

// Создать/обновить оценку
router.post('/', addOrUpdateGrade);

// Soft delete оценки
router.delete('/:id', softDeleteGrade);

module.exports = router;
