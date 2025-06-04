// backend/services/TeacherService.ts
const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

class TeacherService {
  /**
   * 1) Получить всех активных преподавателей.
   *    Возвращаем id, ФИО (из связанного User), email и classroomNumber.
   */
  async getAllTeachers() {
    const teachers = await prisma.teacher.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
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
        classroomNumber: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' },
    });

    return teachers.map((t) => ({
      id: t.id,
      user: {
        id: t.user.id,
        name: t.user.name,
        surname: t.user.surname,
        patronymic: t.user.patronymic,
        email: t.user.email,
        role: t.user.role.name,
      },
      classroomNumber: t.classroomNumber,
      createdAt: t.createdAt,
    }));
  }

  /**
   * 2) Получить одного преподавателя по его userId.
   */
  async getByUserId(userId) {
    const teacher = await prisma.teacher.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        classroomNumber: true,
        createdAt: true,
      },
    });
    return teacher || null;
  }

  /**
   * 3) Soft-delete преподавателя по его userId.
   */
  async deleteTeacher(userId) {
    await prisma.teacher.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  /**
   * 4) Восстановить преподавателя (soft-undelete) по userId, если был удалён.
   */
  async restoreTeacher(userId) {
    await prisma.teacher.updateMany({
      where: { userId, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    return { success: true };
  }

  /**
   * 5) Создать нового преподавателя или восстановить soft-deleted запись по userId.
   *    Используется при смене роли пользователя на TEACHER.
   */
  async createOrRestore(userId) {
    const existing = await prisma.teacher.findUnique({
      where: { userId },
      select: { id: true, deletedAt: true },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Восстановить soft-deleted
        await prisma.teacher.update({
          where: { id: existing.id },
          data: { deletedAt: null },
        });
      }
      // Если существует и не удалён — ничего не делаем
      return;
    }

    // Если не существует — создаём новую запись
    await prisma.teacher.create({
      data: { user: { connect: { id: userId } } },
    });
  }
}

module.exports = new TeacherService();
