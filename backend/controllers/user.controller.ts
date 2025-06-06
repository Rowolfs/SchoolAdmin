// backend/controllers/user.controller.ts
const UserService = require('../services/UserService');

/**
 * GET /api/users/me
 * Профиль текущего пользователя
 */
async function getProfile(req, res, next) {
  try {
    const userId = Number(req.user.id);
    const user = await UserService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id:         user.id,
      email:      user.email,
      name:       user.name,
      surname:    user.surname,
      patronymic: user.patronymic,
      role:       user.role,
      createdAt:  user.createdAt
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users
 * Список пользователей (ADMIN)
 */
async function getUsers(req, res, next) {
  try {
    const excludeId = Number(req.user.id);
    const users = await UserService.getAllUsers(excludeId);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/search?q=...
 * Поиск пользователей по ФИО
 */
async function searchUsers(req, res, next) {
  try {
    const excludeId = Number(req.user.id);
    const q = String(req.query.q || '').trim(); // убираем пробелы по краям

    if (!q) {
      return res.status(400).json({ message: 'Параметр "q" обязателен и не может быть пустым' });
    }

    const users = await UserService.searchUsersByName(q, excludeId);
    return res.json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/users/filter
 * Фильтрация по дате создания или роли (ADMIN)
 */
async function filterUsers(req, res, next) {
  try {
    const excludeId = Number(req.user.id);
    const { from, to, role } = req.body;
    let users;
    if (from && to) {
      users = await UserService.filterUsersByCreatedAt(new Date(from), new Date(to), excludeId);
    } else if (role) {
      users = await UserService.filterUsersByRole(role, excludeId);
    } else {
      return res.status(400).json({ message: 'Invalid filter parameters' });
    }
    res.json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/users/:id/role
 * Смена роли пользователя (ADMIN)
 */
async function changeUserRoleHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const updated = await UserService.updateUser(userId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/users/:id
 * Мягкое удаление пользователя (ADMIN)
 */
async function deleteUserHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    await UserService.deleteUser(userId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

// backend/controllers/user.controller.ts

async function updateUserHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);

    // Добавляем classId и classroomNumber в деструктуризацию:
    const { name, surname, patronymic, role, email, classId, classroomNumber } = req.body;

    // Прокидываем все сразу в сервис, даже если не все нужны:
    const updated = await UserService.updateUser(userId, {
      name,
      surname,
      patronymic,
      email,
      role,
      classId,         // для Pupil (если role === "STUDENT")
      classroomNumber  // для Teacher (если role === "TEACHER")
    });

    // Разворачиваем результат
    const flat = {
      id:         updated.id,
      name:       updated.name,
      surname:    updated.surname,
      patronymic: updated.patronymic,
      email:      updated.email,
      createdAt:  updated.createdAt,
      role:       updated.role
    };

    res.json(flat);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  getUsers,
  searchUsers,
  filterUsers,
  changeUserRoleHandler,
  deleteUserHandler,
  updateUserHandler
};
