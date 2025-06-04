// backend/controllers/discipline.controller.ts
const DisciplineService = require('../services/DisciplineService');

class DisciplineController {
  // GET /api/disciplines
  static async getAll(req, res) {
    try {
      const disciplines = await DisciplineService.getAllDisciplines();
      return res.status(200).json(disciplines);
    } catch (error) {
      console.error('DisciplineController.getAll error:', error);
      return res.status(500).json({ message: 'Ошибка загрузки дисциплин' });
    }
  }

  // POST /api/disciplines
  static async create(req, res) {
    try {
      const { name, description } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Поле name обязательно и должно быть строкой' });
      }
      const newDisc = await DisciplineService.createDiscipline({ name: name.trim(), description });
      return res.status(201).json({
        id: newDisc.id,
        name: newDisc.name,
        description: newDisc.description,
      });
    } catch (error) {
      console.error('DisciplineController.create error:', error);
      return res.status(500).json({ message: 'Ошибка при создании дисциплины' });
    }
  }

  // DELETE /api/disciplines/:id
  static async remove(req, res) {
    try {
      const disciplineId = Number(req.params.id);
      if (Number.isNaN(disciplineId)) {
        return res.status(400).json({ message: 'Неправильный ID дисциплины' });
      }
      await DisciplineService.deleteDiscipline(disciplineId);
      return res.sendStatus(204);
    } catch (error) {
      console.error('DisciplineController.remove error:', error);
      return res.status(500).json({ message: 'Ошибка при удалении дисциплины' });
    }
  }

  // GET /api/disciplines/:id/teachers
  static async getTeachers(req, res) {
    try {
      const disciplineId = Number(req.params.id);
      if (Number.isNaN(disciplineId)) {
        return res.status(400).json({ message: 'Неправильный ID дисциплины' });
      }
      const teachers = await DisciplineService.getTeachersByDiscipline(disciplineId);
      return res.status(200).json(teachers);
    } catch (error) {
      console.error('DisciplineController.getTeachers error:', error);
      return res.status(500).json({ message: 'Ошибка загрузки преподавателей для дисциплины' });
    }
  }

  // PUT /api/disciplines/:id/teachers
  static async assignTeachers(req, res) {
    try {
      const disciplineId = Number(req.params.id);
      if (Number.isNaN(disciplineId)) {
        return res.status(400).json({ message: 'Неправильный ID дисциплины' });
      }
      const { teacherIds } = req.body;
      if (!Array.isArray(teacherIds) || teacherIds.some(id => typeof id !== 'number')) {
        return res.status(400).json({ message: 'teacherIds должен быть массивом чисел' });
      }
      await DisciplineService.assignTeachersToDiscipline(disciplineId, teacherIds);
      return res.sendStatus(204);
    } catch (error) {
      console.error('DisciplineController.assignTeachers error:', error);
      return res.status(500).json({ message: 'Ошибка при назначении преподавателей' });
    }
  }
}

module.exports = DisciplineController;
