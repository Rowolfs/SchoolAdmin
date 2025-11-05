// frontend/pages/dashboard/index.tsx
import React from 'react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
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

export default function DashboardPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <DashboardLayout user={user}>
      <h1 className="text-2xl mb-4">
        Добро пожаловать, {user.name} {user.surname}!
      </h1>
      {/* ваши виджеты */}
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps<{
  user: User
}> = async (ctx) => {
  const cookie = ctx.req.headers.cookie || ''
  try {
    // Берём пользователя сразу на сервере, через настроенный api-инстанс
    const { data: user } = await api.get<User>('/users/me', {
      headers: { Cookie: cookie },
    })
    console.log( { props: { user } } )
    return { props: { user } }
  } catch {
    // Если не залогинен — редирект на логин
    console.log("back to auth")
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }
}
