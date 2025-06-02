// frontend/utils/authAPI.ts

import apiClient from './apiClient';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';

/**
 * Тип пользователя, возвращаемый /api/users/me
 */
export interface UserPayload {
  id: number;
  email: string;
  name: string;
  surname: string;
  patronymic: string;
  role: string;
  createdAt: string;
}

/**
 * Проверка JWT-токена на стороне сервера (SSR).
 * Использует nookies.parseCookies(ctx) вместо ручного разбора headers.
 * Если куки token нет или невалиден, возвращает null.
 */
export async function verifyTokenOnServer(
  ctx: GetServerSidePropsContext
): Promise<UserPayload | null> {
  const cookies = parseCookies(ctx);
  const token = cookies.token; // Браузер записывает JWT в cookie с именем "token"

  if (!token) {
    return null;
  }

  try {
    // Передаём JWT в заголовке Authorization
    const response = await apiClient.get<UserPayload>('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Методы для клиентской аутентификации (login, logout, getCurrentUser)
 */
export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<void> {
  await apiClient.post('/auth/login', payload);
}

export async function logoutUser(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getCurrentUserClient(): Promise<UserPayload | null> {
  try {
    const response = await apiClient.get<UserPayload>('/users/me');
    return response.data;
  } catch {
    return null;
  }
}
