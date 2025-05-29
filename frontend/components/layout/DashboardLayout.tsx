// frontend/components/layout/DashboardLayout.tsx
'use client'

import React, { ReactNode, useState } from 'react'
import { useRouter } from 'next/router'
import { actionConfig, ActionButton } from '@/utils/actionConfig'

interface MenuItem {
  title: string
  path: string
}

const menuConfig: Record<'admin'|'teacher'|'student', MenuItem[]> = {
  admin: [
    { title: 'Панель', path: '/dashboard' },
    { title: 'Пользователи', path: '/dashboard/users' },
    { title: 'Учителя', path: '/dashboard/teachers' },
    { title: 'Ученики', path: '/dashboard/students' },
    { title: 'Классы', path: '/dashboard/classes' },
  ],
  teacher: [
    { title: 'Панель', path: '/dashboard' },
    { title: 'Ученики', path: '/dashboard/students' },
    { title: 'Оценки', path: '/dashboard/grades' },
  ],
  student: [
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

  // Ждём, пока user и role загрузятся
  if (!user || !user.role) {
    return <div>Загрузка...</div>
  }

  // Приводим роль к нижнему регистру для lookup в конфигах
  const roleKey = user.role.toLowerCase() as 'admin'|'teacher'|'student'
  const items = menuConfig[roleKey] || []
  const actions: ActionButton[] = actionConfig[roleKey] || []

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
            <div className="text-sm capitalize">{user.role.toLowerCase()}</div>
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
                <div className="text-sm capitalize">{user.role.toLowerCase()}</div>
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

        {/* панель кнопок */}
        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map(btn => (
            <button
              key={btn.id}
              onClick={btn.onClick ?? (() => btn.path && router.push(btn.path))}
              className={`px-4 py-2 rounded font-medium
                ${btn.variant === 'primary'   ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                ${btn.variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : ''}
                ${btn.variant === 'danger'    ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
