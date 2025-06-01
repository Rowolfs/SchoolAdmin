// backend/controllers/class.controller.ts
const ClassService = require('../services/ClassService');

/**
 * GET /api/classes
 * Вернуть список всех (неудалённых) классов
 */
async function viewClasses(req, res, next) {
  try {
    const classes = await ClassService.getAllClasses();
    return res.json(classes);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/classes/:id
 * Вернуть конкретный класс по ID (если не удалён)
 */
async function viewClassById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const cls = await ClassService.getClassById(id);
    if (!cls) {
      return res.status(404).json({ message: 'Class not exist' });
    }
    return res.json(cls);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/classes
 * Создать новый класс
 */
async function createClass(req, res, next) {
  try {
    const { classTeacher } = req.body;
    const newClass = await ClassService.createClass({ classTeacher });
    return res.status(201).json(newClass);
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/classes/:id
 * Обновить класс (назначить/сменить учителя)
 */
async function updateClass(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { classTeacher } = req.body;
    const updated = await ClassService.updateClass(id, { classTeacher });
    return res.json(updated);
  } catch (err) {
    // Prisma: если запись не найдена, будет код ошибки P2025
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Класс не найден' });
    }
    return next(err);
  }
}

/**
 * DELETE /api/classes/:id
 * Soft-delete (установить deletedAt)
 */
async function deleteClass(req, res, next) {
  try {
    const id = Number(req.params.id);
    await ClassService.deleteClass(id);
    return res.sendStatus(204);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Класс не найден' });
    }
    return next(err);
  }
}

/**
 * POST /api/classes/:id/students
 * Назначить учеников в класс
 * Body: { studentIds: number[] }
 */
async function assignStudents(req, res, next) {
  try {
    const classId = Number(req.params.id);
    const studentIds = Array.isArray(req.body.studentIds)
      ? req.body.studentIds.map((x) => Number(x))
      : [];
    const assigned = await ClassService.assignStudentsToClass(classId, studentIds);
    return res.json(assigned);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  viewClasses,
  viewClassById,
  createClass,
  updateClass,
  deleteClass,
  assignStudents,
};
