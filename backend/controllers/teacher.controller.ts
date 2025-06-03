// backend/controllers/teacher.controller.js
const TeacherService = require('../services/TeacherService');

/**
 * GET /api/teachers
 * Возвращает всех активных преподавателей
 */
async function viewAllTeachers(req, res, next) {
  try {
    const teachers = await TeacherService.getAllTeachers();
    return res.json(teachers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка получения преподавателей' });
  }
}

/**
 * GET /api/teachers/user/:userId
 * (Если нужно: получить преподавателя по userId, но это опционально)
 */
async function viewTeacherByUserId(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const teacher = await TeacherService.getByUserId(userId);
    if (!teacher) {
      return res.status(404).json({ message: 'Преподаватель не найден' });
    }
    return res.json(teacher);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка получения преподавателя' });
  }
}

/**
 * DELETE /api/teachers/user/:userId
 * Soft-delete преподавателя
 */
async function deleteTeacher(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    await TeacherService.deleteTeacher(userId);
    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка при удалении преподавателя' });
  }
}

/**
 * PATCH /api/teachers/user/:userId/restore
 * Восстановить преподавателя
 */
async function restoreTeacher(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    await TeacherService.restoreTeacher(userId);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка при восстановлении преподавателя' });
  }
}

module.exports = {
  viewAllTeachers,
  viewTeacherByUserId,
  deleteTeacher,
  restoreTeacher
};
