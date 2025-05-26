// components/layout/DashboardLayout.tsx
import React, { ReactNode, useState } from 'react'
import { useRouter } from 'next/router'

interface MenuItem {
  title: string
  path: string
}

const menuConfig: Record<string, MenuItem[]> = {
  admin: [
    { title: 'Панель', path: '/dashboard' },
    { title: 'Учителя', path: '/dashboard/teachers' },
    { title: 'Ученики', path: '/dashboard/students' },
    { title: 'Оценки', path: '/dashboard/grades' },
    { title: 'Админы', path: '/dashboard/admins' },
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
  user: { id: string; role: string; name: string }
  children: ReactNode
}

export default function DashboardLayout({
  user,
  children,
}: DashboardLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()
  const items = menuConfig[user.role] || []

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex flex-col w-64 bg-black text-white">
        <div className="p-4 flex items-center space-x-3">
          <div className="rounded-full bg-gray-500 h-10 w-10" />
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm capitalize">{user.role}</div>
          </div>
        </div>
        <nav className="mt-6 flex-grow">
          {items.map((item) => (
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

      <header className="md:hidden flex items-center justify-between bg-black text-white p-4">
        <button onClick={() => setDrawerOpen(true)} aria-label="Открыть меню">
          <svg width="24" height="24" fill="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="font-semibold">{user.name}</div>
      </header>

      <div
        className={`fixed inset-0 z-50 flex ${
          drawerOpen ? '' : 'hidden'
        }`}
      >
        <div className="w-64 bg-black text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm capitalize">{user.role}</div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Закрыть меню"
            >
              <svg width="24" height="24" fill="currentColor">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
          <nav className="mt-6">
            {items.map((item) => (
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

      <main className="flex-grow bg-gray-100 p-6">{children}</main>
    </div>
  )
}
