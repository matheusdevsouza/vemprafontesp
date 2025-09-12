import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, isAuthenticated, isEmailVerified } from '@/lib/auth';
import { getUserById } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Verificar token de autenticação
    const payload = await authenticateUser(request);
    
    if (!isAuthenticated(payload)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Não autenticado',
          authenticated: false 
        },
        { status: 401 }
      );
    }

    // Buscar dados completos do usuário
    if (!payload) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido',
          authenticated: false 
        },
        { status: 401 }
      );
    }
    
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuário não encontrado',
          authenticated: false 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Usuário autenticado',
        authenticated: true,
        emailVerified: isEmailVerified(payload),
        user: {
          id: user.id,
          name: user.name,
          display_name: user.display_name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf,
          birth_date: user.birth_date,
          gender: user.gender,
          address: user.address,
          email_verified_at: user.email_verified_at,
          last_login: user.last_login,
          is_admin: user.is_admin,
          created_at: user.created_at,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        authenticated: false 
      },
      { status: 500 }
    );
  }
} 