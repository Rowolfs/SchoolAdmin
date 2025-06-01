// backend/services/PupilService.js
const PrismaSingelton = require('../prisma/client');
const prisma = PrismaSingelton.getInstance();

class PupilService {
  /**
   * Получить всех активных учеников
   * Возвращает данные ученика вместе с информацией о пользователе
   */
  async getAllPupils() {
    const pupils = await prisma.pupil.findMany({
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
        class: {
          select: {
            id: true
          }
        },
        createdAt: true
      }
    });

    return pupils.map(p => ({
      id: p.id,
      user: {
        id: p.user.id,
        name: p.user.name,
        surname: p.user.surname,
        patronymic: p.user.patronymic,
        email: p.user.email,
        role: p.user.role.name
      },
      classId: p.class.id,
      createdAt: p.createdAt
    }));
  }

  /**
   * Получить ученика по userId
   */
  async getByUserId(userId) {
    const pupil = await prisma.pupil.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        classId: true,
        createdAt: true
      }
    });
    return pupil || null;
  }

  /**
   * Обновить данные ученика
   */
  async updateUser(userId: number, payload: { name?: string; surname?: string; patronymic?: string; role?: string; classId?: number }) {
  const { name, surname, patronymic, role: newRoleName, classId } = payload;

  // 1) Получаем старую роль
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } }
  });
  if (!existing) throw new Error(`User с id=${userId} не найден`);
  const oldRole = existing.role.name;

  // 2) Подготавливаем объект data для обновления User
  const data: any = {};
  if (name !== undefined)       data.name = name;
  if (surname !== undefined)    data.surname = surname;
  if (patronymic !== undefined) data.patronymic = patronymic;
  if (newRoleName !== undefined) {
    data.role = { connect: { name: newRoleName } };
  }

  // 3) Если новая роль — STUDENT, а старая не STUDENT → создаём Pupil
  if (newRoleName === 'STUDENT' && oldRole !== 'STUDENT') {
    // обязательно classId
    if (!classId) {
      throw new Error('При смене роли на STUDENT необходимо указать classId');
    }

    // проверяем, что класс существует
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true }
    });
    if (!cls) {
      throw new Error(`Class с id=${classId} не найден`);
    }

    // создаём Pupil, привязанного к этому пользователю и классу
    await prisma.pupil.create({
      data: {
        user: { connect: { id: userId } },
        class: { connect: { id: classId } }
      }
    });
  }

  // 4) Если старая роль — STUDENT, а новая не STUDENT → soft-delete Pupil
  if (oldRole === 'STUDENT' && newRoleName !== 'STUDENT') {
    await prisma.pupil.updateMany({
      where: { userId },
      data: { deletedAt: new Date() }
    });
  }

  // 5) Обновляем поля самого User
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
   * Soft-delete ученика
   */
  async deletePupil(userId) {
    await prisma.pupil.updateMany({
      where: { userId },
      data: { deletedAt: new Date() }
    });
    return { success: true };
  }

  /**
   * Восстановить ученика (если ранее был soft-deleted)
   */
  async restorePupil(userId) {
    await prisma.pupil.updateMany({
      where: { userId },
      data: { deletedAt: null }
    });
    return { success: true };
  }
}

module.exports = new PupilService();
