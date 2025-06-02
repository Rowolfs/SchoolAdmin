// frontend/utils/auth.ts

import { GetServerSidePropsContext } from 'next';
import api from './api';
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
 */
export async function verifyTokenOnServer(
  ctx: GetServerSidePropsContext
): Promise<UserPayload | null> {
  // 1) parseCookies сам достаёт заголовок "cookie" из ctx.req и разбивает его в объект
  const cookies = parseCookies(ctx);
  const token = cookies.token; // nookies хранит куки в cookies.token

  if (!token) {
    return null;
  }

  try {
    // 2) Делаем запрос к бэку, передаём токен в заголовке Authorization
    const response = await api.get<UserPayload>('/users/me', {
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
 * Клиентский логин: отправляем {email, password} на /login, 
 * бэкенд выставляет HTTP-only куку "token".
 */
export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<void> {
  await api.post('/login', { email: payload.email, password: payload.password });
}

/**
 * Клиентский логаут: отправляем POST /logout, бэкенд должен удалить HTTP-only куку.
 */
export async function logoutUser(): Promise<void> {
  await api.post('/logout');
}

/**
 * Клиентская проверка текущего пользователя (если кука token уже установлена браузером).
 */
export async function getCurrentUserClient(): Promise<UserPayload | null> {
  try {
    const response = await api.get<UserPayload>('/users/me');
    return response.data;
  } catch {
    return null;
  }
}
