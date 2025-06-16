// backend/controllers/discipline.controller.js
const DisciplineService = require('../services/DisciplineService');
const TeacherService = require('../services/TeacherService');

module.exports = {
  // GET /api/disciplines
  async getAll(req, res) {
    const list = await DisciplineService.getAllDisciplines();
    res.json(list);
  },

  // POST /api/disciplines
  async create(req, res) {
    const created = await DisciplineService.create(req.body);
    res.status(201).json(created);
  },

  // DELETE /api/disciplines/:id
  async remove(req, res) {
    const id = Number(req.params.id);
    await DisciplineService.remove(id);
    res.sendStatus(204);
  },

  // GET /api/disciplines/:id/teachers
  async getTeachers(req, res) {
    const id = Number(req.params.id);
    const teachers = await TeacherService.getByDiscipline(id);
    res.json(teachers);
  },

  // GET /api/disciplines/:id/teachers/search
  async searchTeachersByDiscipline(req, res) {
    const disciplineId = Number(req.params.id);
    const search = String(req.query.search || '');
    // все подходящие по ФИО
    const all = await TeacherService.searchAllTeachers(search);
    // уже назначенные
    const assigned = await TeacherService.getByDiscipline(disciplineId);
    const assignedIds = new Set(assigned.map(t => t.id));
    // помечаем
    const result = all.map(t => ({ ...t, assigned: assignedIds.has(t.id) }));
    res.json(result);
  },

  // PUT /api/disciplines/:id/teachers
  async assignTeachers(req, res) {
    const disciplineId = Number(req.params.id);
    const { teacherIds } = req.body;
    await DisciplineService.assignTeachers(disciplineId, teacherIds);
    res.sendStatus(204);
  },
};
