// frontend/middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  console.log('Middleware check for:', request.url)
  
  // ИСПРАВЬТЕ ТАК:
  const token = request.cookies.get('token')?.value  // <- добавьте .value
  
  console.log('Token found:', !!token)
  
  if (!token) {
    console.log('No token, redirecting to login')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  console.log('Token OK, allowing access')
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']  // убедитесь что путь правильный
}
