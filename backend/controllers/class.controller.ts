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
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Неверный ID класса' });
    }

    const cls = await ClassService.getClassById(id);
    if (!cls) {
      return res.status(404).json({ message: 'Класс не найден' });
    }
    return res.json(cls);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/classes
 * Создать новый класс
 * Body: { name: string, classTeacher?: number }
 */
async function createClass(req, res, next) {
  try {
    const { name, classTeacher } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Поле name обязательно и должно быть строкой' });
    }
    const created = await ClassService.createClass({
      name: name.trim(),
      classTeacher: classTeacher !== undefined ? Number(classTeacher) : null,
    });
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/classes/:id
 * Обновить класс (назначить/сменить учителя)
 * Body: { classTeacher?: number | null }
 */
async function updateClass(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Неверный ID класса' });
    }
    const { classTeacher } = req.body;
    if (classTeacher !== undefined && classTeacher !== null && isNaN(Number(classTeacher))) {
      return res.status(400).json({ message: 'classTeacher должен быть числом или null' });
    }

    const updated = await ClassService.updateClass(id, {
      classTeacher: classTeacher !== undefined ? (classTeacher === null ? null : Number(classTeacher)) : undefined,
    });
    return res.json(updated);
  } catch (err) {
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
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Неверный ID класса' });
    }
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
 * Body: { pupilIds: number[] }
 */
async function assignStudents(req, res, next) {
  try {
    const classId = Number(req.params.id);
    if (Number.isNaN(classId)) {
      return res.status(400).json({ message: 'Неверный ID класса' });
    }
    const { pupilIds } = req.body;
    if (!Array.isArray(pupilIds) || pupilIds.some(id => isNaN(Number(id)))) {
      return res.status(400).json({ message: 'pupilIds должен быть массивом чисел' });
    }
    const ids = pupilIds.map((x) => Number(x));
    const assigned = await ClassService.assignStudentsToClass(classId, ids);
    return res.json(assigned);
  } catch (err) {
    return next(err);
  }
}

async function viewDisciplineTeacherPairs(req, res, next) {
  try {
    const classId = Number(req.params.id);
    if (isNaN(classId)) return res.status(400).json({ error: 'Неверный ID класса' });
    const data = await ClassService.getDisciplineTeacherPairs(classId);
    res.json(data);
  } catch (err) {
    return next(err);
  }
}

async function searchDisciplineTeacherPairs(req, res, next) {
  try {
    const classId = Number(req.params.id);
    const search = String(req.query.search || '');
    if (isNaN(classId)) return res.status(400).json({ error: 'Неверный ID класса' });
    const data = await ClassService.searchDisciplineTeacherPairs(classId, search);
    res.json(data);
  } catch (err) {
    return next(err);
  }
}

async function assignDisciplineTeacherPairs(req, res, next) {
  try {
    const classId = Number(req.params.id);
    const { pairs } = req.body;
    if (isNaN(classId)) return res.status(400).json({ error: 'Неверный ID класса' });
    await ClassService.assignDisciplineTeacherPairs(classId, pairs);
    res.sendStatus(204);
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
  viewDisciplineTeacherPairs,
  searchDisciplineTeacherPairs,
  assignDisciplineTeacherPairs,
};
