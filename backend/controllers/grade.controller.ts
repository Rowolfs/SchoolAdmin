// backend/controllers/grade.controller.ts

const GradeService = require('../services/GradeService');

/**
 * Получить все дисциплины и классы, где преподаёт учитель
 * GET /api/grades/teacher-classes?teacherId=...
 */
async function getDisciplinesAndClassesByTeacher(req, res) {
  try {
    let { teacherId } = req.query;
    teacherId = Number(teacherId)
    if (!teacherId) return res.status(400).json({ error: 'teacherId required' });
    const data = await GradeService.getDisciplinesAndClassesByTeacher(teacherId);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * Получить всех учеников класса
 * GET /api/grades/pupils?classId=...
 */
async function getPupilsByClass(req, res) {
  try {
    let { classId } = req.query;
    classId = Number(classId)
    if (!classId) return res.status(400).json({ error: 'classId required' });
    const data = await GradeService.getPupilsByClass(classId);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * Получить оценки по дисциплине, классу и четверти
 * GET /api/grades?classId=...&disciplineTeacherId=...&quarter=...
 */
async function getGrades(req, res) {
  try {
    let { classId, disciplineTeacherId, quarter } = req.query;
    if (!classId || !disciplineTeacherId)
      return res.status(400).json({ error: 'classId, disciplineTeacherId, quarter обязательны' });

    classId = Number(classId);
    disciplineTeacherId = Number(disciplineTeacherId);

    if (isNaN(classId) || isNaN(disciplineTeacherId)) {
      return res.status(400).json({ error: 'classId и disciplineTeacherId должны быть числами' });
    }

    const data = await GradeService.getGrades({ classId, disciplineTeacherId, quarter });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * Создать или обновить оценку (поиск по disciplineTeacherId/classId/pupilId/quarter)
 * POST /api/grades
 * body: { classId, pupilId, disciplineTeacherId, quarter, mark }
 */
async function addOrUpdateGrade(req, res) {
  try {
    let { classId, pupilId, disciplineTeacherId, quarter, mark } = req.body;
    classId = Number(classId)
    pupilId = Number(pupilId)
    disciplineTeacherId = Number(disciplineTeacherId)
    quarter = Number(quarter)
    mark = Number(mark)

    if (!classId || !pupilId || !disciplineTeacherId || !quarter || mark == null)
      return res.status(400).json({ error: 'Все поля обязательны' });
    const data = await GradeService.addOrUpdateGrade({ classId, pupilId, disciplineTeacherId, quarter, mark });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * Soft delete — "удалить" оценку
 * DELETE /api/grades/:id
 */
async function softDeleteGrade(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id обязателен' });
    const data = await GradeService.softDeleteGrade(id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = {
  getDisciplinesAndClassesByTeacher,
  getPupilsByClass,
  getGrades,
  addOrUpdateGrade,
  softDeleteGrade,
};
