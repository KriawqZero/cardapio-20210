import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se é a área administrativa (exceto login)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Verificar se já está autenticado
    const isAuthenticated = request.cookies.get('admin_auth')?.value === 'authenticated';
    
    if (!isAuthenticated) {
      // Redirecionar para a página de login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 