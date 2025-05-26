// pages/dashboard/index.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../utils/api'
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'teacher' | 'student'
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    api.get<User>('/users')
      .then(res => setUser(res.data))
      .catch(() => {
        router.push('/auth/login')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Загрузка...</div>
  if (!user) return null

  return (
    <div className={`${geistSans.className} ${geistMono.className}`}>
      <DashboardLayout user={user}>
        <h1 className="text-2xl mb-4">Добро пожаловать, {user.name}!</h1>
        {/* Здесь ваши виджеты */}
      </DashboardLayout>
    </div>
  )
}
