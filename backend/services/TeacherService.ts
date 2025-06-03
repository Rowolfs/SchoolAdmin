// backend/services/TeacherService.js
const PrismaSingelton = require('../prisma/client');
const prisma = PrismaSingelton.getInstance();

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
            role: { select: { name: true } }
          }
        },
        classroomNumber: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });

    // Преобразуем немного в более плоскую структуру, если хочется
    return teachers.map(t => ({
      id: t.id,
      user: {
        id: t.user.id,
        name: t.user.name,
        surname: t.user.surname,
        patronymic: t.user.patronymic,
        email: t.user.email,
        role: t.user.role.name
      },
      classroomNumber: t.classroomNumber,
      createdAt: t.createdAt
    }));
  }

  /**
   * 2) Получить одного преподавателя по его userId (не обязательно для назначения, но пригодится).
   */
  async getByUserId(userId) {
    const teacher = await prisma.teacher.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        classroomNumber: true,
        createdAt: true
      }
    });
    return teacher || null;
  }

  /**
   * 3) Soft-delete преподавателя по его userId
   */
  async deleteTeacher(userId) {
    await prisma.teacher.updateMany({
      where: { userId },
      data: { deletedAt: new Date() }
    });
    return { success: true };
  }

  /**
   * 4) Восстановить преподавателя (soft-undelete) по userId
   */
  async restoreTeacher(userId) {
    await prisma.teacher.updateMany({
      where: { userId },
      data: { deletedAt: null }
    });
    return { success: true };
  }
}

module.exports = new TeacherService();
