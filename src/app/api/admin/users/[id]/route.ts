import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, isAdmin } from '@/lib/auth';
import database from '@/lib/database';
import { decryptFromDatabase } from '@/lib/transparent-encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Buscar usuário do banco
    const users = await database.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Descriptografar dados do usuário automaticamente
    const decryptedUser = decryptFromDatabase('users', users[0]);
    
    // Buscar estatísticas do usuário
    const orderStats = await database.query(`
      SELECT 
        COUNT(*) as orderCount,
        SUM(total_amount) as totalSpent
      FROM orders 
      WHERE user_id = ?
    `, [id]);

    const userData = {
      ...decryptedUser,
      orderCount: orderStats[0]?.orderCount || 0,
      totalSpent: orderStats[0]?.totalSpent || 0
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, phone, is_active, is_admin } = body;

    // Atualizar usuário
    await database.query(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, is_active = ?, is_admin = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, email, phone, is_active, is_admin, id]);

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}