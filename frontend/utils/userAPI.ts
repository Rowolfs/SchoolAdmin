// frontend/utils/userAPI.ts

import apiClient from './apiClient';

/**
 * Интерфейс для пользователя (User).
 * Поля должны соответствовать тому, что вы отдаёте в ответе бэкенда.
 */
export interface User {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: string;
}

/**
 * UserAPI: методы для работы с `/users`:
 *  - getProfile()            — GET /api/users/me
 *  - getAll()                — GET /api/users
 *  - search(q)               — GET /api/users/search?q=...
 *  - changeRole(id, role)    — PATCH /api/users/:id/role
 *  - deleteUser(id)          — DELETE /api/users/:id
 *  - updateUser(id, payload) — PATCH /api/users/:id
 */
export const UserAPI = {
  /**
   * Получить профиль текущего пользователя.
   * Возвращает Promise<User>
   */
  getProfile: (): Promise<User> =>
    apiClient.get<User>('/users/me').then(res => res.data),

  /**
   * Получить всех пользователей (кроме, например, себя). 
   * Возвращает Promise<User[]>
   */
  getAll: (): Promise<User[]> =>
    apiClient.get<User[]>('/users').then(res => res.data),

  /**
   * Поиск пользователей по ФИО. 
   * GET /api/users/search?q=...
   * Возвращает Promise<User[]>
   */
  search: (q: string): Promise<User[]> =>
    apiClient.get<User[]>('/users/search', { params: { q } }).then(res => res.data),

  /**
   * Смена роли пользователя (только ADMIN).
   * PATCH /api/users/:id/role  body: { role: 'TEACHER'|'STUDENT'|'ADMIN' }
   * Возвращает Promise<User> (обновлённый user)
   */
  changeRole: (id: number, newRole: 'ADMIN' | 'TEACHER' | 'STUDENT') =>
    apiClient.patch<User>(`/users/${id}/role`, { role: newRole }).then(res => res.data),

  /**
   * Мягкое удаление пользователя (soft-delete).
   * DELETE /api/users/:id
   * Возвращает Promise<void>
   */
  deleteUser: (id: number) =>
    apiClient.delete<void>(`/users/${id}`),

  /**
   * Обновление пользователя (имя, фамилия, email, role и т. д.).
   * PATCH /api/users/:id  body: { name?, surname?, patronymic?, email?, role?, ... }
   * Возвращает Promise<User> (обновлённый)
   */
  updateUser: (
    id: number,
    payload: {
      name?: string;
      surname?: string;
      patronymic?: string;
      email?: string;
      role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
      classId?: number;         // если меняем роль на STUDENT
      classroomNumber?: string; // если меняем роль на TEACHER
    }
  ): Promise<User> =>
    apiClient.patch<User>(`/users/${id}`, payload).then(res => res.data),
};
