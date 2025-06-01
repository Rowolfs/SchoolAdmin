// backend/controllers/student.controller.ts
const PupilService = require('../services/PupilService');

/**
 * GET /api/students
 * Вернуть список всех учеников (students), то есть всё из PupilService.getAllPupils
 */
async function viewStudents(req, res, next) {
  try {
    const pupils = await PupilService.getAllPupils();
    // Переименуем поле userId в student.userId и возвращаем как «students»
    // Но по сути можно вернуть прямиком, фронт пусть сам смотрит userId/ФИО
    return res.json(pupils);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/students/class/:classId
 * Вернуть учеников одного класса (students by class), обёртка над getPupilsByClass
 */
async function viewStudentsByClass(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    const pupils = await PupilService.getPupilsByClass(classId);
    return res.json(pupils);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  viewStudents,
  viewStudentsByClass,
};
