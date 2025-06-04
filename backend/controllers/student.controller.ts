// backend/controllers/student.controller.ts
const PupilService = require('../services/PupilService');

/**
 * GET /api/students
 * Вернуть список всех учеников
 */
async function viewStudents(req, res, next) {
  try {
    const pupils = await PupilService.getAllPupils();
    return res.json(pupils);
  } catch (err) {
    console.error('Error in viewStudents:', err);
    return res.status(500).json({ error: 'Ошибка получения списка учеников' });
  }
}

/**
 * GET /api/students/class/:classId
 * Вернуть учеников одного класса
 */
async function viewStudentsByClass(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    if (Number.isNaN(classId)) {
      return res.status(400).json({ error: 'Неверный идентификатор класса' });
    }

    const pupils = await PupilService.getPupilsByClass(classId);
    return res.json(pupils);
  } catch (err) {
    console.error('Error in viewStudentsByClass:', err);
    return res.status(500).json({ error: 'Ошибка получения учеников класса' });
  }
}

/**
 * GET /api/students/search?query=...
 * Поиск учеников по ФИО
 */
async function searchStudents(req, res, next) {
  try {
    const query = String(req.query.query || '').trim();
    if (!query) {
      return res.status(400).json({ error: 'Параметр "query" обязателен' });
    }

    const result = await PupilService.searchPupils(query);
    return res.json(result);
  } catch (err) {
    console.error('Error in searchStudents:', err);
    return res.status(500).json({ error: 'Ошибка поиска учеников' });
  }
}

module.exports = {
  viewStudents,
  viewStudentsByClass,
  searchStudents
};
