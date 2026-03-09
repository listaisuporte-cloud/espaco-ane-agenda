import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não precisam de autenticação
const rotasPublicas = ['/api/auth/login', '/api/seed'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se é uma rota de API que precisa de proteção
  if (pathname.startsWith('/api/') && !rotasPublicas.some(rota => pathname.startsWith(rota))) {
    const token = request.cookies.get('auth_token');

    if (token?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado', code: 401 }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
