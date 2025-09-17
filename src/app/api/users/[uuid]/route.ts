import { NextRequest, NextResponse } from 'next/server';
import { getUserByUuid } from '@/lib/database';
import { authenticateUser, isAuthenticated } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    // Verificar autenticação
    const payload = await authenticateUser(request);
    
    if (!isAuthenticated(payload)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Não autenticado' 
        },
        { status: 401 }
      );
    }

    const { uuid } = params;

    // Validar formato do UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'UUID inválido' 
        },
        { status: 400 }
      );
    }

    // Buscar usuário por UUID
    const user = await getUserByUuid(uuid);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuário não encontrado' 
        },
        { status: 404 }
      );
    }

    // Verificar se o usuário pode acessar estes dados
    // (apenas o próprio usuário ou admin)
    if (payload && (payload.userId !== user.id && !payload.isAdmin)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Acesso negado' 
        },
        { status: 403 }
      );
    }

    // Retornar dados do usuário (já descriptografados)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        uuid: user.user_uuid,
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
    });

  } catch (error) {
    console.error('Erro ao buscar usuário por UUID:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
