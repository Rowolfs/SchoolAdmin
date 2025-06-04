// backend/services/DisciplineService.ts
const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

class DisciplineService {
  /**
   * Получить все дисциплины (неудалённые) с назначенными преподавателями.
   */
  static async getAllDisciplines() {
    const disciplines = await prisma.discipline.findMany({
      where: { deletedAt: null },
      include: {
        disciplineTeachers: {
          where: { deletedAt: null },
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
      teachers: disc.disciplineTeachers.map((dt) => ({
        id: dt.teacher.id,
        user: dt.teacher.user,
      })),
    }));
  }

  /**
   * Создать новую дисциплину.
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
   * Получить преподавателей по дисциплине.
   */
  static async getTeachersByDiscipline(disciplineId) {
    // Проверяем, что дисциплина существует и не удалена
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

    return entries.map((entry) => ({
      id: entry.teacher.id,
      user: entry.teacher.user,
    }));
  }

  /**
   * Назначить преподавателей на дисциплину (полная перезапись).
   */
  static async assignTeachersToDiscipline(disciplineId, teacherIds) {
    // 1. Проверка дисциплины
    const existingDisc = await prisma.discipline.findUnique({
      where: { id: disciplineId },
      select: { id: true, deletedAt: true },
    });
    if (!existingDisc || existingDisc.deletedAt) {
      throw new Error(`Дисциплина с id=${disciplineId} не найдена или удалена`);
    }

    // 2. Soft-delete всех текущих связей disciplineTeacher
    await prisma.disciplineTeacher.updateMany({
      where: { disciplineId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    // 3. Если нет учителей — выходим
    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return;
    }

    // 4. Обрабатываем каждый teacherId
    for (const teacherId of teacherIds) {
      // Проверяем существование и активность учителя
      const existingTeacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { id: true, deletedAt: true },
      });
      if (!existingTeacher || existingTeacher.deletedAt) {
        throw new Error(`Учитель с id=${teacherId} не найден или удалён`);
      }

      // Пытаемся найти уже существующую (возможно soft-deleted) ссылку
      const existingLink = await prisma.disciplineTeacher.findUnique({
        where: { disciplineId_teacherId: { disciplineId, teacherId } },
        select: { id: true, deletedAt: true },
      });

      if (existingLink) {
        if (existingLink.deletedAt) {
          // Восстанавливаем soft-deleted связь
          await prisma.disciplineTeacher.update({
            where: { id: existingLink.id },
            data: { deletedAt: null },
          });
        }
        // Иначе связь уже активна — ничего не делаем
      } else {
        // Создаём новую связь
        await prisma.disciplineTeacher.create({
          data: { disciplineId, teacherId },
        });
      }
    }
  }

  /**
   * Soft-delete дисциплины.
   */
  static async deleteDiscipline(id) {
    return prisma.discipline.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = DisciplineService;
