import { useEffect, useState } from 'react'
import api from '../utils/api'

type Teacher = {
  id: number
  classroomNumber: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])

  useEffect(() => {
    api.get('/teachers')
      .then((res) => setTeachers(res.data))
      .catch((err) => console.error('Ошибка при получении данных:', err))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Преподаватели</h1>
      <ul className="space-y-2">
        {teachers.map((t) => (
          <li key={t.id} className="p-2 border rounded shadow-sm">
            Кабинет: {t.classroomNumber}
          </li>
        ))}
      </ul>
    </div>
  )
}
