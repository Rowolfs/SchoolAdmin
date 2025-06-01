// frontend/hooks/useSearchUsers.ts
import { useQuery } from '@tanstack/react-query';
import { UserAPI, User } from '../utils/api';

/**
 * Хук для поиска пользователей (по ФИО)
 * GET /api/users/search?q=…
 * @param query - строка поиска
 */
export function useSearchUsers(query: string) {
  return useQuery<User[]>(
    ['searchUsers', query],
    () => UserAPI.search(query).then((res) => res.data),
    {
      enabled: query.trim().length > 0,
      staleTime: 1000 * 60 * 5, // 5 минут кеширования
    }
  );
}
