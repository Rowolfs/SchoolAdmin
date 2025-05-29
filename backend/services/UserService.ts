// backend/services/UserService.ts
const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

class UserService {
  /**
   * Получить всех активных пользователей (кроме супер-админа и себя)
   */
  async getAllUsers(excludeUserId) {
    return prisma.user.findMany({
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
  }

  /**
   * Получить пользователя по ID
   */
  async getById(userId) {
    return prisma.user.findUnique({
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
  }

  /**
   * Поиск пользователей по ФИО
   */
  async searchUsersByName(query, excludeUserId) {
    return prisma.user.findMany({
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
  }

  /**
   * Фильтрация пользователей по дате создания
   */
  async filterUsersByCreatedAt(from, to, excludeUserId) {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: excludeUserId },
        role: { name: { not: 'SuperAdmin' } },
        createdAt: { gte: from, lte: to }
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
  }

  /**
   * Фильтрация пользователей по роли
   */
  async filterUsersByRole(roleName, excludeUserId) {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: excludeUserId },
        role: { name: roleName }
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
  }

  /**
   * Смена роли пользователя
   */
  async changeUserRole(userId, newRoleName) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: { connect: { name: newRoleName } } },
      select: { id: true, email: true, role: { select: { name: true } } }
    });
  }

  /**
   * Мягкое удаление пользователя
   */
  async deleteUser(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    });
  }
}

module.exports = new UserService();
