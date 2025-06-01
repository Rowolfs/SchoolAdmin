// backend/services/TeacherService.js
const PrismaSingelton = require('../prisma/client');
const prisma = PrismaSingelton.getInstance();

class TeacherService {
  /**
   * Получить всех активных преподавателей
   * Возвращает данные учителя вместе с информацией о пользователе
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
      }
    });

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
   * Получить преподавателя по userId
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
   * Обновить данные преподавателя
   */
async updateUser(userId: number, payload: { name?: string; surname?: string; patronymic?: string; role?: string; classId?: number; classroomNumber?: string }) {
  const { name, surname, patronymic, role: newRoleName, classId, classroomNumber } = payload;

  // 1) Получаем старую роль
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } }
  });
  if (!existing) throw new Error(`User с id=${userId} не найден`);
  const oldRole = existing.role.name;

  // 2) Собираем data для обновления User
  const data: any = {};
  if (name !== undefined)       data.name = name;
  if (surname !== undefined)    data.surname = surname;
  if (patronymic !== undefined) data.patronymic = patronymic;
  if (newRoleName !== undefined) {
    data.role = { connect: { name: newRoleName } };
  }

  // 3) Если новая роль — TEACHER, а старая ≠ TEACHER → создаём Teacher
  if (newRoleName === 'TEACHER' && oldRole !== 'TEACHER') {
    // Обязательно задаём, как минимум, user.connect.
    // Допустим, для Teacher требуется classroomNumber (можно оставить пустым или взять из payload).
    await prisma.teacher.create({
      data: {
        user: { connect: { id: userId } },
        classroomNumber: classroomNumber ?? '' // если не передали, ставим пустую строку
        // Если нужно связать с Class, добавить: classClass: { connect: { id: classId! } }
      }
    });
  }

  // 4) Если старая роль — TEACHER, а новая ≠ TEACHER → soft-delete Teacher
  if (oldRole === 'TEACHER' && newRoleName !== 'TEACHER') {
    await prisma.teacher.updateMany({
      where: { userId },
      data: { deletedAt: new Date() }
    });
  }

  // 5) Если новая роль — STUDENT (обработка Pupil)…

  // 6) Наконец, обновляем самого User
  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      surname: true,
      patronymic: true,
      email: true,
      role: { select: { name: true } },
      createdAt: true
    }
  });

  return {
    id: updated.id,
    name: updated.name,
    surname: updated.surname,
    patronymic: updated.patronymic,
    email: updated.email,
    role: updated.role.name,
    createdAt: updated.createdAt
  };
}


  /**
   * Soft-delete преподавателя
   */
  async deleteTeacher(userId) {
    await prisma.teacher.updateMany({
      where: { userId },
      data: { deletedAt: new Date() }
    });
    return { success: true };
  }

  /**
   * Восстановить преподавателя (если ранее был soft-deleted)
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
