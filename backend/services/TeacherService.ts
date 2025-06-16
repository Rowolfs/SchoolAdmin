// backend/services/TeacherService.ts
const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

class TeacherService {
  /**
   * 1) Получить всех активных преподавателей.
   */
  async getAllTeachers() {
    const teachers = await prisma.teacher.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        classroomNumber: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            patronymic: true,
            email: true,
            role: { select: { name: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return teachers.map(t => ({
      id: t.id,
      classroomNumber: t.classroomNumber,
      user: {
        id: t.user.id,
        name: t.user.name,
        surname: t.user.surname,
        patronymic: t.user.patronymic,
        email: t.user.email,
        role: t.user.role.name,
      },
    }));
  }

  /**
   * 2) Получить преподавателя по userId.
   */
  async getByUserId(userId) {
    const t = await prisma.teacher.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        classroomNumber: true,
        user: { select: { id: true } },
      },
    });
    return t
      ? { id: t.id, classroomNumber: t.classroomNumber, userId: t.user.id }
      : null;
  }

  /**
   * 3) Soft-delete преподавателя по userId.
   */
  async deleteTeacher(userId) {
    await prisma.teacher.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * 4) Восстановить преподавателя (soft-undelete) по userId.
   */
  async restoreTeacher(userId) {
    await prisma.teacher.updateMany({
      where: { userId, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
  }

  /**
   * 5) Создать или восстановить преподавателя по userId.
   */
  async createOrRestore(userId) {
    const existing = await prisma.teacher.findUnique({
      where: { userId },
      select: { id: true, deletedAt: true },
    });
    if (existing) {
      if (existing.deletedAt) {
        await prisma.teacher.update({
          where: { id: existing.id },
          data: { deletedAt: null },
        });
      }
      return;
    }
    await prisma.teacher.create({ data: { user: { connect: { id: userId } } } });
  }

  /**
   * 6) Получить всех преподавателей, назначенных на дисциплину.
   */
  async getByDiscipline(disciplineId: number) {
    const teachers = await prisma.teacher.findMany({
      where: {
        deletedAt: null,
        disciplines: {
          some: {
            deletedAt: null,
            disciplineId: disciplineId,
          },
        },
      },
      select: {
        id: true,
        classroomNumber: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            patronymic: true,
            email: true,
            role: { select: { name: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return teachers.map(t => ({
      id: t.id,
      classroomNumber: t.classroomNumber,
      user: {
        id: t.user.id,
        name: t.user.name,
        surname: t.user.surname,
        patronymic: t.user.patronymic,
        email: t.user.email,
        role: t.user.role.name,
      },
    }));
  }

  /**
   * 7) Поиск всех преподавателей по ФИО (без учёта дисциплины).
   */
  async searchAllTeachers(searchStr: string) {
    const where: any = { deletedAt: null };
    if (searchStr) {
      where.OR = [
        { user: { name: { contains: searchStr, mode: 'insensitive' } } },
        { user: { surname: { contains: searchStr, mode: 'insensitive' } } },
        { user: { patronymic: { contains: searchStr, mode: 'insensitive' } } },
      ];
    }

    const teachers = await prisma.teacher.findMany({
      where,
      select: {
        id: true,
        classroomNumber: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            patronymic: true,
            email: true,
            role: { select: { name: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return teachers.map(t => ({
      id: t.id,
      classroomNumber: t.classroomNumber,
      user: {
        id: t.user.id,
        name: t.user.name,
        surname: t.user.surname,
        patronymic: t.user.patronymic,
        email: t.user.email,
        role: t.user.role.name,
      },
    }));
  }
}

module.exports = new TeacherService();
