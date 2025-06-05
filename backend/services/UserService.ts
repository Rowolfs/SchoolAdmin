// backend/services/UserService.ts
const bcrypt = require('bcrypt');
const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();
const TeacherService = require('./TeacherService');
const PupilService = require('./PupilService');

class UserService {
  /**
   * Регистрация нового пользователя.
   */
  async registerUser({ email, password, roleName, name, surname, patronymic }) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) throw new Error('User already exists');

    const role = await prisma.role.findUnique({
      where: { name: roleName },
      select: { id: true, name: true },
    });
    if (!role) throw new Error('Invalid role');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
        surname,
        patronymic,
        role: { connect: { id: role.id } },
      },
      include: { role: true },
    });

    if (role.name === 'STUDENT') {
      await PupilService.createPupil(user.id);

    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      role: user.role.name,
      createdAt: user.createdAt,
    };
  }

  /**
   * Получить всех активных пользователей (кроме супер-админа и себя).
   */
  async getAllUsers(excludeUserId) {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: excludeUserId },
        email: { not: 'admin@admin.ru' },
      },
      select: {
        id: true,
        name: true,
        surname: true,
        patronymic: true,
        email: true,
        role: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      surname: u.surname,
      patronymic: u.patronymic,
      email: u.email,
      role: u.role.name,
      createdAt: u.createdAt,
    }));
  }

  /**
   * Получить пользователя по ID.
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
        createdAt: true,
      },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      role: user.role.name,
      createdAt: user.createdAt,
    };
  }

  /**
   * Поиск пользователей по ФИО.
   */
  async searchUsersByName(query, excludeUserId) {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: excludeUserId },
        email: { not: 'admin@admin.ru' },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { surname: { contains: query, mode: 'insensitive' } },
          { patronymic: { contains: query, mode: 'insensitive' } },
        ],
      },
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

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      surname: u.surname,
      patronymic: u.patronymic,
      email: u.email,
      role: u.role.name,
      createdAt: u.createdAt,
    }));
  }

  /**
   * Обновление полей пользователя (имя, фамилия, отчество, email, роль).
   * При смене роли создаёт/удаляет Teacher или Pupil.
   */
  async updateUser(userId, payload) {
    const { name, surname, patronymic, email, role: newRoleName } = payload;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } },
    });
    if (!existing) throw new Error(`User с id=${userId} не найден`);
    const oldRole = existing.role.name;

    const data = {};
    if (name !== undefined) data.name = name;
    if (surname !== undefined) data.surname = surname;
    if (patronymic !== undefined) data.patronymic = patronymic;
    if (email !== undefined) data.email = email;
    if (newRoleName !== undefined) {
      data.role = { connect: { name: newRoleName } };
    }

    // Если роль меняется на TEACHER
    if (newRoleName === 'TEACHER' && oldRole !== 'TEACHER') {
      await TeacherService.createOrRestore(userId);
    } else if (oldRole === 'TEACHER' && newRoleName !== 'TEACHER') {
      await TeacherService.deleteTeacher(userId);
    }

    // Если роль меняется на STUDENT
    if (newRoleName === 'STUDENT' && oldRole !== 'STUDENT') {
      await PupilService.restorePupil(userId);
    } else if (oldRole === 'STUDENT' && newRoleName !== 'STUDENT') {
      await PupilService.deletePupil(userId);
    }

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
   * Мягкое удаление пользователя (и его связей).
   */
  async deleteUser(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    await TeacherService.deleteTeacher(userId);
    await PupilService.deletePupil(userId);
    return { success: true };
  }
}

module.exports = new UserService();
