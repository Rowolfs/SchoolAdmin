// frontend/components/layout/DashboardLayout.tsx
'use client'

import React, { ReactNode, use, useState } from 'react'
import { useRouter } from 'next/router'


interface MenuItem {
  title: string
  path: string
}

const menuConfig: Record<'ADMIN'|'TEACHER'|'STUDENT', MenuItem[]> = {
  ADMIN: [
    { title: 'Панель', path: '/dashboard' },
    { title: 'Пользователи', path: '/dashboard/users' },
    { title: 'Классы', path: '/dashboard/classes' },
    { title: 'Дисциплинны', path: '/dashboard/disciplines' },

  ],
  TEACHER: [
    { title: 'Панель', path: '/dashboard' },
    { title: 'Классы', path: '/dashboard/classes' },
    { title: 'Оценки', path: '/dashboard/grades' },
  ],
  STUDENT: [
    { title: 'Панель', path: '/dashboard' },
    { title: 'Мои оценки', path: '/dashboard/grades' },
  ],
}

interface DashboardLayoutProps {
  user: {
    id: number
    role: 'ADMIN' | 'TEACHER' | 'STUDENT'
    name: string
    surname: string
    patronymic: string
    email: string
  }
  children: ReactNode
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Получаем пункты меню для роли пользователя
  const items = menuConfig[user.role];

  // Ждём, пока user и role загрузятся
  if (!user || !user.role) {
    return <div>Загрузка...</div>
  }



  return (
    <div className="flex min-h-screen">
      {/* Sidebar для desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-black text-white">
        {/* Профиль */}
        <div className="p-4 flex items-center space-x-3">
          <div className="rounded-full bg-gray-500 h-10 w-10" />
          <div>
            <div className="font-semibold">
              {user.name} {user.surname} {user.patronymic}
            </div>
            <div className="text-sm capitalize">{user.role}</div>
          </div>
        </div>
        {/* Меню */}
        <nav className="mt-6 flex-grow">
          {items.map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="block w-full text-left px-4 py-2 hover:bg-blue-600"
            >
              {item.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Header для mobile */}
      <header className="md:hidden flex items-center justify-between bg-black text-white p-4">
        <button onClick={() => setDrawerOpen(true)} aria-label="Открыть меню">
          <svg width="24" height="24" fill="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="font-semibold">{user.name}</div>
      </header>

      {/* Drawer для mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-black text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm capitalize">{user.role}</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Закрыть меню">
                <svg width="24" height="24" fill="currentColor">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
            <nav className="mt-6">
              {items.map(item => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path)
                    setDrawerOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-blue-600"
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-grow" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Основная область с контентом и панелью кнопок */}
      <main className="flex-grow bg-gray-100 p-6 flex flex-col">
        {/* здесь рендерим children */}
        {children}
      </main>
    </div>
  )
}
