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
        userId: true,
        classId: true,
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
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
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
      classId: p.classId,
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
   * Получить всех учеников, прикреплённых к конкретному классу (classId)
   * Возвращает массив объектов: { id: Pupil.id, userId, classId, user: { id, name, surname, patronymic, email, role } }
   */
  async getPupilsByClass(classId) {
    const pupils = await prisma.pupil.findMany({
      where: {
        classId,
        deletedAt: null
      },
      select: {
        id: true,
        userId: true,
        classId: true,
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
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
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
      classId: p.classId,
      createdAt: p.createdAt
    }));
  }

  /**
   * Обновить данные ученика (при смене роли, classId и т.д.)
   */
  async updateUser(userId, payload) {
    const { name, surname, patronymic, role: newRoleName, classId } = payload;

    // 1) Получаем старую роль
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } }
    });
    if (!existing) throw new Error(`User с id=${userId} не найден`);
    const oldRole = existing.role.name;

    // 2) Подготавливаем данные для обновления User
    const dataUser: any = {};
    if (name !== undefined)       dataUser.name = name;
    if (surname !== undefined)    dataUser.surname = surname;
    if (patronymic !== undefined) dataUser.patronymic = patronymic;
    if (newRoleName !== undefined) {
      dataUser.role = { connect: { name: newRoleName } };
    }

    // 3) Логика для TEACHER
    if (newRoleName === 'TEACHER' && oldRole !== 'TEACHER') {
      const existingTeacher = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true, deletedAt: true }
      });
      if (existingTeacher) {
        if (existingTeacher.deletedAt !== null) {
          await prisma.teacher.update({
            where: { userId },
            data: { deletedAt: null }
          });
        }
      } else {
        await prisma.teacher.create({
          data: {
            user: { connect: { id: userId } }
          }
        });
      }
    }
    if (oldRole === 'TEACHER' && newRoleName !== 'TEACHER') {
      await prisma.teacher.updateMany({
        where: { userId },
        data: { deletedAt: new Date() }
      });
    }

    // 4) Логика для STUDENT
    if (newRoleName === 'STUDENT') {
      if (oldRole !== 'STUDENT') {
        // смена с не-STUDENT на STUDENT → создаём запись Pupil
        await prisma.pupil.create({
          data: {
            user: { connect: { id: userId } },
            classId: classId ?? null
          }
        });
      } else {
        // если уже был STUDENT и пришёл новый classId → обновляем
        if (classId !== undefined) {
          const existingPupil = await prisma.pupil.findFirst({
            where: { userId, deletedAt: null },
            select: { id: true, classId: true }
          });
          if (existingPupil) {
            if (classId !== existingPupil.classId) {
              await prisma.pupil.update({
                where: { id: existingPupil.id },
                data: { classId }
              });
            }
          } else {
            // если по какой-то причине не было записи, создаём
            await prisma.pupil.create({
              data: {
                user: { connect: { id: userId } },
                classId: classId ?? null
              }
            });
          }
        }
      }
    }
    if (oldRole === 'STUDENT' && newRoleName !== 'STUDENT') {
      // смена со STUDENT на не-STUDENT → soft-delete Pupil
      await prisma.pupil.updateMany({
        where: { userId },
        data: { deletedAt: new Date() }
      });
    }

    // 5) Обновляем запись User
    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataUser,
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
   * Soft-delete ученика (Pupil) по userId
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
