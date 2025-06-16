// backend/controllers/teacher.controller.ts
import { Request, Response, NextFunction } from 'express';
const TeacherService = require('../services/TeacherService');

/**
 * GET /api/teachers
 * Возвращает всех активных преподавателей
 */
export async function viewAllTeachers(req: Request, res: Response, next: NextFunction) {
  try {
    const teachers = await TeacherService.getAllTeachers();
    return res.json(teachers);
  } catch (error) {
    console.error('Error in viewAllTeachers:', error);
    return res.status(500).json({ error: 'Ошибка получения преподавателей' });
  }
}

/**
 * GET /api/teachers/user/:userId
 * Получить преподавателя по userId (если нужен)
 */
export async function viewTeacherByUserId(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Неверный идентификатор пользователя' });
    }

    const teacher = await TeacherService.getByUserId(userId);
    if (!teacher) {
      return res.status(404).json({ message: 'Преподаватель не найден' });
    }
    return res.json(teacher);
  } catch (error) {
    console.error('Error in viewTeacherByUserId:', error);
    return res.status(500).json({ error: 'Ошибка получения преподавателя' });
  }
}

/**
 * DELETE /api/teachers/user/:userId
 * Soft-delete преподавателя
 */
export async function deleteTeacher(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Неверный идентификатор пользователя' });
    }

    await TeacherService.deleteTeacher(userId);
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error in deleteTeacher:', error);
    return res.status(500).json({ error: 'Ошибка при удалении преподавателя' });
  }
}

/**
 * PATCH /api/teachers/user/:userId/restore
 * Восстановить преподавателя
 */
export async function restoreTeacher(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Неверный идентификатор пользователя' });
    }

    await TeacherService.restoreTeacher(userId);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in restoreTeacher:', error);
    return res.status(500).json({ error: 'Ошибка при восстановлении преподавателя' });
  }
}

/**
 * GET /api/disciplines/:disciplineId/teachers
 * Возвращает всех преподавателей, назначенных на дисциплину
 */
export async function viewTeachersByDiscipline(req: Request, res: Response, next: NextFunction) {
  try {
    const disciplineId = Number(req.params.disciplineId);
    if (Number.isNaN(disciplineId)) {
      return res.status(400).json({ error: 'Неверный идентификатор дисциплины' });
    }
    const teachers = await TeacherService.getByDiscipline(disciplineId);
    return res.json(teachers);
  } catch (error) {
    console.error('Error in viewTeachersByDiscipline:', error);
    return res.status(500).json({ error: 'Ошибка получения преподавателей по дисциплине' });
  }
}

/**
 * GET /api/disciplines/:disciplineId/teachers/search
 * Поиск преподавателей по ФИО с отметкой уже назначенных на дисциплину
 */
export async function searchTeachersByDiscipline(req: Request, res: Response, next: NextFunction) {
  try {
    const disciplineId = Number(req.params.id);
    if (Number.isNaN(disciplineId)) {
      return res.status(400).json({ error: 'Неверный идентификатор дисциплины' });
    }
    const search = String(req.query.search || '');
    // все преподаватели по ФИО
    const all = await TeacherService.searchAllTeachers(search);
    // уже назначенные
    const assigned = await TeacherService.getByDiscipline(disciplineId);
    const assignedIds = new Set(assigned.map((t: any) => t.id));
    // помечаем
    const result = all.map((t: any) => ({
      ...t,
      assigned: assignedIds.has(t.id),
    }));
    return res.json(result);
  } catch (error) {
    console.error('Error in searchTeachersByDiscipline:', error);
    return res.status(500).json({ error: 'Ошибка поиска преподавателей по дисциплине' });
  }
}
