// frontend/pages/auth/register.tsx
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import api from '../../utils/api'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    try {
        if(password != repeatPassword){
          setError('Passwords don\'t match');
          return;  
        }
      const response = await api.post('/auth/register', {
        email,
        password,
        roleName: role,
        name,
        surname,
        patronymic
      })
      localStorage.setItem('token', response.data.token)
      router.push('/teachers')
    } catch (err: any) {

    // напиши сообшение о том что пльзователь уже зарегистрирован
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="auth-container">
      <h1>Register</h1>
      {error && <p className="error">{error}</p>}
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Surname"
        value={surname}
        onChange={e => setSurname(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Patronymic"
        value={patronymic}
        onChange={e => setPatronymic(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Repeat Password"
        value={repeatPassword}
        onChange={e => setRepeatPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
      <p>
        Already have an account? <Link href="/auth/login">Login</Link>
      </p>
    </div>
  )
}

export default RegisterPage