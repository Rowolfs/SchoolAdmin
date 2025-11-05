// frontend/pages/dashboard/index.tsx
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/utils/api'

interface User {
  id: number
  email: string
  name: string
  surname: string
  patronymic: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Проверяем токен в localStorage
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth/login')
          return
        }

        // Загружаем данные пользователя
        const { data: userData } = await api.get<User>('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        console.log('✅ User loaded:', userData)
        setUser(userData)
      } catch (error) {
        console.log('❌ Auth failed:', error)
        localStorage.removeItem('token')
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Загрузка...</div>
      </div>
    )
  }

  // Если пользователя нет - редирект уже происходит
  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user}>
      <h1 className="text-2xl mb-4">
        Добро пожаловать, {user.name} {user.surname}!
      </h1>
      {/* ваши виджеты */}
    </DashboardLayout>
  )
}
