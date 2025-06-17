// backend/services/DisciplineService.ts

const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

class DisciplineService {
  /**
   * Получить все дисциплины (неудалённые) с активными преподавателями.
   */
   static async getAllDisciplines() {
    const disciplines = await prisma.discipline.findMany({
      where: { deletedAt: null },
      include: {
        disciplineTeachers: {
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
      teachers: disc.disciplineTeachers
        // Фильтрация по не удалённым связям и только по живым учителям
        .filter(dt => dt.deletedAt === null && dt.teacher && dt.teacher.deletedAt === null)
        .map(dt => ({
          id: dt.teacher.id,
          user: dt.teacher.user,
        })),
    }));
  }

  /**
   * Получить преподавателей по дисциплине.
   */
  static async getTeachersByDiscipline(disciplineId) {
    const existingDisc = await prisma.discipline.findUnique({
      where: { id: disciplineId },
      select: { id: true, deletedAt: true },
    });
    if (!existingDisc || existingDisc.deletedAt) {
      throw new Error(`Дисциплина с id=${disciplineId} не найдена или удалена`);
    }

    const entries = await prisma.disciplineTeacher.findMany({
      where: {
        disciplineId,
        deletedAt: null,
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

    return entries
      .filter(entry => entry.teacher && entry.teacher.deletedAt == null)
      .map(entry => ({
        id: entry.teacher.id,
        user: entry.teacher.user,
      }));
  }

  /**
   * Создать новую дисциплину.
   */
  static async create(data) {
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
   * Назначить преподавателей на дисциплину (полная перезапись).
   */
  static async assignTeachers(disciplineId, teacherIds) {
    const existingDisc = await prisma.discipline.findUnique({
      where: { id: disciplineId },
      select: { id: true, deletedAt: true },
    });
    if (!existingDisc || existingDisc.deletedAt) {
      throw new Error(`Дисциплина с id=${disciplineId} не найдена или удалена`);
    }

    await prisma.disciplineTeacher.updateMany({
      where: { disciplineId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return;
    }

    for (const teacherId of teacherIds) {
      const existingTeacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { id: true, deletedAt: true },
      });
      if (!existingTeacher || existingTeacher.deletedAt) {
        throw new Error(`Учитель с id=${teacherId} не найден или удалён`);
      }

      const existingLink = await prisma.disciplineTeacher.findUnique({
        where: { disciplineId_teacherId: { disciplineId, teacherId } },
        select: { id: true, deletedAt: true },
      });

      if (existingLink) {
        if (existingLink.deletedAt) {
          await prisma.disciplineTeacher.update({
            where: { id: existingLink.id },
            data: { deletedAt: null },
          });
        }
      } else {
        await prisma.disciplineTeacher.create({
          data: { disciplineId, teacherId },
        });
      }
    }
  }

  /**
   * Soft-delete дисциплины.
   */
  static async remove(id) {
    return prisma.discipline.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = DisciplineService;
