import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Senha do sistema - MUDE EM PRODUÇÃO!
const SENHA_ACESSO = process.env.SENHA_ACESSO || 'espacoane2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senha } = body;

    if (senha === SENHA_ACESSO) {
      const cookieStore = await cookies();
      cookieStore.set('auth_token', 'authenticated', {
        httpOnly: true,
        secure: true, // Sempre true em produção
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
      });

      return NextResponse.json({ success: true, message: 'Autenticado com sucesso' });
    }

    return NextResponse.json({ success: false, message: 'Senha incorreta' }, { status: 401 });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ success: false, message: 'Erro no login' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (token?.value === 'authenticated') {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    return NextResponse.json({ success: true, message: 'Logout realizado' });
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json({ success: false, message: 'Erro no logout' }, { status: 500 });
  }
}
