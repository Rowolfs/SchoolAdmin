// frontend/components/Layouts/DefaultLayout.tsx
import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { AuthAPI, UserPayload } from '../../utils/authAPI';

interface DefaultLayoutProps {
  children: ReactNode;
}

/**
 * DefaultLayout:
 * 1) useQuery вызывается на клиенте, чтобы получить текущего пользователя.
 * 2) Пока идёт загрузка (isLoading), рендерим «Loading…».
 * 3) Если данных нет (user === null), делаем роутер.push('/auth/login').
 * 4) Если есть, показываем header + children.
 */
const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const router = useRouter();

  // useQuery, чтобы получить текущего пользователя (через cookie)
  const { data: user, isLoading } = useQuery<UserPayload | null>(
    ['currentUser'],
    () => AuthAPI.getCurrentUserClient()
  );

  // Если ещё загружаем — показываем простой спиннер/текст
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не авторизован — перенаправляем на /auth/login
  // и не показываем остальную разметку
  if (!user) {
    useEffect(() => {
      router.replace('/auth/login');
    }, [router]);
    return null;
  }

  // Если user есть — рисуем header и основной контент
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-100 p-4 flex justify-between items-center">
        <div>
          <span className="font-semibold">
            Здравствуйте, {user.surname} {user.name}
          </span>{' '}
          ({user.role})
        </div>
        <div className="space-x-4">
          <button
            onClick={async () => {
              await AuthAPI.logout();
              router.replace('/auth/login');
            }}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Выйти
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        © 2025 Ваша школа
      </footer>
    </div>
  );
};

export default DefaultLayout;
