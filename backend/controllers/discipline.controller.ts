// backend/controllers/discipline.controller.ts
const DisciplineService = require('../services/DisciplineService');

/**
 * @swagger
 * tags:
 *   - name: Disciplines
 *     description: Эндпоинты для работы с дисциплинами
 */
class DisciplineController {
  /**
   * @swagger
   * /api/disciplines:
   *   get:
   *     summary: Получить все дисциплины
   *     tags:
   *       - Disciplines
   *     responses:
   *       200:
   *         description: Список дисциплин
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Discipline'
   *       500:
   *         description: Ошибка загрузки дисциплин
   */
  static async getAll(req, res) {
    try {
      const disciplines = await DisciplineService.getAllDisciplines();
      return res.status(200).json(disciplines);
    } catch (error) {
      console.error('DisciplineController.getAll error:', error);
      return res.status(500).json({ message: 'Ошибка загрузки дисциплин' });
    }
  }

  /**
   * @swagger
   * /api/disciplines:
   *   post:
   *     summary: Создать новую дисциплину
   *     tags:
   *       - Disciplines
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 example: Математика
   *               description:
   *                 type: string
   *                 example: Дисциплина для изучения алгебры и геометрии
   *     responses:
   *       201:
   *         description: Дисциплина создана
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Discipline'
   *       400:
   *         description: Поле name обязательно
   *       500:
   *         description: Ошибка при создании дисциплины
   */
  static async create(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res
          .status(400)
          .json({ message: 'Поле name обязательно' });
      }
      const newDisc = await DisciplineService.createDiscipline({ name, description });
      return res
        .status(201)
        .json({ id: newDisc.id, name: newDisc.name, description: newDisc.description, teachers: [] });
    } catch (error) {
      console.error('DisciplineController.create error:', error);
      return res.status(500).json({ message: 'Ошибка при создании дисциплины' });
    }
  }

  /**
   * @swagger
   * /api/disciplines/{id}:
   *   delete:
   *     summary: Удалить дисциплину
   *     tags:
   *       - Disciplines
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID удаляемой дисциплины
   *     responses:
   *       204:
   *         description: Дисциплина успешно удалена
   *       400:
   *         description: Неверный ID дисциплины
   *       500:
   *         description: Ошибка при удалении дисциплины
   */
  static async remove(req, res) {
    try {
      const disciplineId = parseInt(req.params.id, 10);
      if (isNaN(disciplineId)) {
        return res.status(400).json({ message: 'Неправильный ID дисциплины' });
      }
      await DisciplineService.deleteDiscipline(disciplineId);
      return res.status(204).end();
    } catch (error) {
      console.error('DisciplineController.remove error:', error);
      return res.status(500).json({ message: 'Ошибка при удалении дисциплины' });
    }
  }

  /**
   * @swagger
   * /api/disciplines/{id}/teachers:
   *   get:
   *     summary: Получить преподавателей по дисциплине
   *     tags:
   *       - Disciplines
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID дисциплины
   *     responses:
   *       200:
   *         description: Список преподавателей
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Teacher'
   *       400:
   *         description: Неверный ID дисциплины
   *       500:
   *         description: Ошибка загрузки преподавателей
   */
  static async getTeachers(req, res) {
    try {
      const disciplineId = parseInt(req.params.id, 10);
      if (isNaN(disciplineId)) {
        return res.status(400).json({ message: 'Неправильный ID дисциплины' });
      }
      const teachers = await DisciplineService.getTeachersByDiscipline(disciplineId);
      return res.status(200).json(teachers);
    } catch (error) {
      console.error('DisciplineController.getTeachers error:', error);
      return res
        .status(500)
        .json({ message: 'Ошибка загрузки преподавателей для дисциплины' });
    }
  }

  /**
   * @swagger
   * /api/disciplines/{id}/teachers:
   *   put:
   *     summary: Назначить преподавателей дисциплине
   *     tags:
   *       - Disciplines
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID дисциплины
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               teacherIds:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 example: [1, 2, 3]
   *     responses:
   *       204:
   *         description: Преподаватели успешно назначены
   *       400:
   *         description: Неверный ID дисциплины или teacherIds не массив
   *       500:
   *         description: Ошибка при назначении преподавателей
   */
  static async assignTeachers(req, res) {
    try {
      const disciplineId = parseInt(req.params.id, 10);
      if (isNaN(disciplineId)) {
        return res.status(400).json({ message: 'Неправильный ID дисциплины' });
      }
      const { teacherIds } = req.body;
      if (!Array.isArray(teacherIds)) {
        return res
          .status(400)
          .json({ message: 'teacherIds должен быть массивом чисел' });
      }
      await DisciplineService.assignTeachersToDiscipline(disciplineId, teacherIds);
      return res.status(204).end();
    } catch (error) {
      console.error('DisciplineController.assignTeachers error:', error);
      return res
        .status(500)
        .json({ message: 'Ошибка при назначении преподавателей' });
    }
  }
}

module.exports = DisciplineController;
