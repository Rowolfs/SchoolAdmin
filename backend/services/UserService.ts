// backend/services/UserService.js
const PrismaSingelton = require('../prisma/client');
const prisma = PrismaSingelton.getInstance();

class UserService {
  /**
   * Получить всех активных пользователей (кроме супер-админа и себя)
   * Возвращает role в виде строки ("ADMIN" | "TEACHER" | "STUDENT"), а не объекта
   */
  async getAllUsers(excludeUserId) {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: excludeUserId },
        role: { name: { not: 'SuperAdmin' } }
      },
      select: {
        id: true,
        name: true,
        surname: true,
        patronymic: true,
        email: true,
        role: { select: { name: true } },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      email: user.email,
      role: user.role.name,
      createdAt: user.createdAt
    }));
  }

  /**
   * Получить пользователя по ID
   * Возвращает role в виде строки
   */
  async getById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        patronymic: true,
        role: { select: { name: true } },
        createdAt: true
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      role: user.role.name,
      createdAt: user.createdAt
    };
  }

  /**
   * Поиск пользователей по ФИО
   * Возвращает role в виде строки
   */
  async searchUsersByName(query, excludeUserId) {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: excludeUserId },
        role: { name: { not: 'SuperAdmin' } },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { surname: { contains: query, mode: 'insensitive' } },
          { patronymic: { contains: query, mode: 'insensitive' } }
        ]
      },
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

    return users.map(user => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      email: user.email,
      role: user.role.name,
      createdAt: user.createdAt
    }));
  }

  /**
   * Обновление полей пользователя (имя, фамилия, отчество, роль)
   * Принимает role как строку ("ADMIN" | "TEACHER" | "STUDENT")
   * При смене роли взаимодействует с TeacherService/PupilService
   */
   async updateUser(
    userId: number,
    payload: {
      name?: string;
      surname?: string;
      patronymic?: string;
      email?: string;
      role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
    }
  ) {
    const { name, surname, patronymic,email, role: newRoleName } = payload;

    // 1) Получаем старую роль
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } },
    });
    if (!existing) {
      throw new Error(`User с id=${userId} не найден`);
    }
    const oldRole = existing.role.name as 'ADMIN' | 'TEACHER' | 'STUDENT';

    // 2) Собираем data для обновления самого User
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (surname !== undefined) data.surname = surname;
    if (patronymic !== undefined) data.patronymic = patronymic;
    if (email !== undefined) data.email = email
    if (newRoleName !== undefined) {
      data.role = { connect: { name: newRoleName } };
    }

    // 3) Если новая роль = TEACHER и раньше ≠ TEACHER → создаём пустой Teacher
    if (newRoleName === 'TEACHER' && oldRole !== 'TEACHER') {
      // Опционально: проверяем, что подобного Teacher нет или был soft-deleted:
      const existingTeacher = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true, deletedAt: true },
      });
      if (existingTeacher) {
        // Восстанавливаем, если он был помечен удалённым:
        if (existingTeacher.deletedAt !== null) {
          await prisma.teacher.update({
            where: { userId },
            data: { deletedAt: null },
          });
        }
      } else {
        // Создаём новый профиль без кабинета
        await prisma.teacher.create({
          data: {
            user: { connect: { id: userId } },
            // classroomNumber по умолчанию null
          },
        });
      }
    }

    // 4) Если новая роль ≠ TEACHER и раньше была TEACHER → soft-delete Teacher
    if (oldRole === 'TEACHER' && newRoleName !== 'TEACHER') {
      await prisma.teacher.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      });
    }

    // 5) Если новая роль = STUDENT и раньше ≠ STUDENT → создаём пустой Pupil
    if (newRoleName === 'STUDENT' && oldRole !== 'STUDENT') {
      const existingPupil = await prisma.pupil.findUnique({
        where: { userId },
        select: { id: true, deletedAt: true },
      });
      if (existingPupil) {
        if (existingPupil.deletedAt !== null) {
          await prisma.pupil.update({
            where: { userId },
            data: { deletedAt: null },
          });
        }
      } else {
        await prisma.pupil.create({
          data: {
            user: { connect: { id: userId } },
            // classId по умолчанию null
          },
        });
      }
    }

    // 6) Если новая роль ≠ STUDENT и раньше была STUDENT → soft-delete Pupil
    if (oldRole === 'STUDENT' && newRoleName !== 'STUDENT') {
      await prisma.pupil.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      });
    }

    // 7) Наконец, обновляем самого User
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
        createdAt: true,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      surname: updated.surname,
      patronymic: updated.patronymic,
      email: updated.email,
      role: updated.role.name,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Мягкое удаление пользователя (User → Teacher → Pupil)
   */
  async deleteUser(userId: number) {
    // Soft-delete User
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    // Soft-delete Teacher (если есть)
    await prisma.teacher.updateMany({
      where: { userId },
      data: { deletedAt: new Date() },
    });
    // Soft-delete Pupil (если есть)
    await prisma.pupil.updateMany({
      where: { userId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}

module.exports = new UserService();
