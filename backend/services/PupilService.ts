// backend/services/PupilService.ts
const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

/**
 * Сервис для работы с сущностью «Pupil».
 * 
 * Важно:
 * 1. Методы, связанные с изменением User (имён, ролей и т.п.), лучше вынести в UserService.
 * 2. Здесь оставляем только «чистые» операции по сущности Pupil: получение, привязка к классу, soft-delete/restore и поиск.
 */
class PupilService {
  /**
   * Получить всех активных учеников.
   * Возвращаем Pupil вместе с информацией о User (ФИО, email, роль).
   */

  // backend/services/PupilService.ts
  async createPupil(userId: number) {
    return prisma.pupil.create({
      data: {
        user:  { connect: { id: userId } },
      }
    });
  }

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
            role: { select: { name: true } },
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pupils.map((p) => ({
      id: p.id,
      user: {
        id: p.user.id,
        name: p.user.name,
        surname: p.user.surname,
        patronymic: p.user.patronymic,
        email: p.user.email,
        role: p.user.role.name,
      },
      classId: p.classId,
      createdAt: p.createdAt,
    }));
  }

  /**
   * Получить одного ученика по userId.
   * Если запись отсутствует или soft-deleted — вернём null.
   */
  async getByUserId(userId) {
    const pupil = await prisma.pupil.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        classId: true,
        createdAt: true,
      },
    });
    return pupil || null;
  }

  /**
   * Получить всех учеников, привязанных к конкретному классу.
   */
  async getPupilsByClass(classId) {
    const pupils = await prisma.pupil.findMany({
      where: {
        classId,
        deletedAt: null,
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
            role: { select: { name: true } },
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pupils.map((p) => ({
      id: p.id,
      user: {
        id: p.user.id,
        name: p.user.name,
        surname: p.user.surname,
        patronymic: p.user.patronymic,
        email: p.user.email,
        role: p.user.role.name,
      },
      classId: p.classId,
      createdAt: p.createdAt,
    }));
  }

  /**
   * Обновить только classId для существующего Pupil (смена класса).
   * Параметр payload: { classId?: number | null }
   */
  async updateClass(userId, payload) {
    const { classId } = payload;

    // Находим запись Pupil (active)
    const existingPupil = await prisma.pupil.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true, classId: true },
    });
    if (!existingPupil) {
      throw new Error(`Pupil с userId=${userId} не найден или удалён`);
    }

    // Если classId не изменился — возвращаем текущую запись без апдейта
    if (classId === existingPupil.classId) {
      return {
        id: existingPupil.id,
        userId,
        classId: existingPupil.classId,
      };
    }

    // Обновляем привязку к классу (может быть null)
    const updated = await prisma.pupil.update({
      where: { id: existingPupil.id },
      data: { classId: classId ?? null },
      select: {
        id: true,
        userId: true,
        classId: true,
      },
    });

    return updated;
  }

  /**
   * Soft-delete Pupil по userId (снимает с учёта ученика).
   */
  async deletePupil(userId) {
    await prisma.pupil.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  /**
   * Восстановить ранее soft-deleted Pupil по userId.
   */
  async restorePupil(userId) {
    await prisma.pupil.updateMany({
      where: { userId, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    return { success: true };
  }

  /**
   * Поиск учеников по части ФИО (поиск игнорирует регистр).
   * Возвращаем id и данные User (ФИО).
   */
  async searchPupils(query) {
    const pupils = await prisma.pupil.findMany({
      where: {
        deletedAt: null,
        user: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { surname: { contains: query, mode: 'insensitive' } },
            { patronymic: { contains: query, mode: 'insensitive' } },
          ],
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            patronymic: true,
          },
        },
      },
    });

    return pupils.map((p) => ({
      id: p.id,
      user: p.user,
    }));
  }
}

module.exports = new PupilService();
