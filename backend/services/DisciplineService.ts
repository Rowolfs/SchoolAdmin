// backend/services/DisciplineService.ts

const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

class DisciplineService {
  /**
   * Получить список всех дисциплин (неудалённых), включая назначенных преподавателей.
   * Учитель-дисциплина определяется записью в MarkRecord, где:
   *   teacherId != null, classId = null, pupilId = null, quarter = null, mark = null
   */
  static async getAllDisciplines() {
    const disciplines = await prisma.discipline.findMany({
      where: { deletedAt: null },
      include: {
        journalEntries: {
          where: {
            teacherId: { not: null },
            classId: null,
            pupilId: null,
            quarter: null,
            mark: null,
          },
          include: {
            teacher: {
              include: {
                user: {
                  select: { id: true, name: true, surname: true, patronymic: true },
                },
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return disciplines.map((disc) => ({
      id: disc.id,
      name: disc.name,
      description: disc.description,
      teachers: disc.journalEntries.map((entry) => ({
        id: entry.teacher.id,
        user: entry.teacher.user,
      })),
    }));
  }

  /**
   * Создать новую дисциплину.
   * data: { name: string; description: string }
   */
  static async createDiscipline(data) {
    const newDisc = await prisma.discipline.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return {
      id: newDisc.id,
      name: newDisc.name,
      description: newDisc.description,
    };
  }

  /**
   * Получить преподавателей, назначенных на дисциплину.
   * Отбираем записи MarkRecord, где disciplineId=, teacherId != null, остальные поля null.
   */
  static async getTeachersByDiscipline(disciplineId) {
    const entries = await prisma.markRecord.findMany({
      where: {
        disciplineId,
        teacherId: { not: null },
        classId: null,
        pupilId: null,
        quarter: null,
        mark: null,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: { id: true, name: true, surname: true, patronymic: true },
            },
          },
        },
      },
    });

    return entries.map((entry) => ({
      id: entry.teacher.id,
      user: entry.teacher.user,
    }));
  }

  /**
   * Назначить список преподавателей на дисциплину. Перезаписывает существующие привязки.
   * teacherIds: number[]
   */
  static async assignTeachersToDiscipline(disciplineId, teacherIds) {
    // Удаляем все текущие привязки «учитель–дисциплина» из MarkRecord
    await prisma.markRecord.deleteMany({
      where: {
        disciplineId,
        teacherId: { not: null },
        classId: null,
        pupilId: null,
        quarter: null,
        mark: null,
      },
    });

    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return;
    }

    // Вставляем новые записи «учитель–дисциплина»
    const createData = teacherIds.map((teacherId) => ({
      teacherId,
      disciplineId,
      // остальные поля по умолчанию null (classId, pupilId, quarter, mark)
    }));

    await prisma.markRecord.createMany({
      data: createData,
    });
  }

  /**
   * Удалить дисциплину (soft-delete): выставить deletedAt = now()
   */
  static async deleteDiscipline(id) {
    return prisma.discipline.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = DisciplineService;
