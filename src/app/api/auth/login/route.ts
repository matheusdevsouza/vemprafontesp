import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { getUserByEmail, updateUserLastLogin } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar se o e-mail está verificado
    if (!user.email_verified_at) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'E-mail não verificado. Verifique sua caixa de entrada e clique no link de verificação.',
          emailNotVerified: true 
        },
        { status: 401 }
      );
    }

    // Verificar se a conta está ativa
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: 'Conta desativada. Entre em contato conosco.' },
        { status: 401 }
      );
    }

    // Atualizar último login
    await updateUserLastLogin(user.id);

    // Gerar token JWT com todos os campos necessários
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      emailVerified: !!user.email_verified_at,
      isAdmin: !!user.is_admin,
    };

    const token = generateToken(tokenPayload);

    // Criar resposta com cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: !!user.email_verified_at,
          is_admin: user.is_admin,
        }
      },
      { status: 200 }
    );

    // Definir cookie de autenticação
    return setAuthCookie(response, token);

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 