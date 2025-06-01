// frontend/utils/actionConfig.ts
export interface ActionButton {
  id: string
  label: string
  path?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

export const actionConfig: Record<'ADMIN' | 'TEACHER' | 'STUDENT', ActionButton[]> = {
  ADMIN: [
    { id: 'manage-users',    label: 'Пользователи', path: '/dashboard/users',   variant: 'primary' },
    { id: 'manage-teachers', label: 'Учителя',      path: '/dashboard/teachers', variant: 'secondary' },
    { id: 'manage-classes',  label: 'Классы',       path: '/dashboard/classes',  variant: 'secondary' },
    { id: 'manage-students', label: 'Ученики',      path: '/dashboard/students', variant: 'secondary' },
  ],
  TEACHER: [
    { id: 'manage-students', label: 'Ученики', path: '/dashboard/students', variant: 'primary' },
    { id: 'manage-grades',   label: 'Оценки',  path: '/dashboard/grades',   variant: 'secondary' },
  ],
  STUDENT: [
    { id: 'view-grades',     label: 'Мои оценки', path: '/dashboard/grades', variant: 'primary' },
  ],
}
