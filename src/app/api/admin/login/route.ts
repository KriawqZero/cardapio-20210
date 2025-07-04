import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'MarcilioLindo123@@@';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (password === ADMIN_PASSWORD) {
      // Criar resposta com cookie de autenticação
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });
      
      return response;
    } else {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 