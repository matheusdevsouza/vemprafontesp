import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { decrypt, decryptUsersForAdmin } from '@/lib/encryption';
import { authenticateUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Buscar usuários com paginação e filtros
    let whereClause = '';
    const params: any[] = [];
    
    if (search) {
      whereClause = ' WHERE (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const offset = (page - 1) * limit;
    
    const users = await query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.address, 
        u.is_admin, 
        u.is_active, 
        u.created_at, 
        u.updated_at,
        u.last_login,
        COALESCE(order_stats.order_count, 0) as orderCount,
        COALESCE(order_stats.total_spent, 0) as totalSpent
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as order_count,
          SUM(total_amount) as total_spent
        FROM orders 
        GROUP BY user_id
      ) order_stats ON u.id = order_stats.user_id
      ${whereClause}
      ORDER BY u.created_at DESC 
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // Contar total de usuários para paginação
    const totalResult = await query(`
      SELECT COUNT(*) as total FROM users 
      ${whereClause}
    `, params);
    
    const totalUsers = totalResult[0].total;

    // DESCRIPTOGRAFIA INTELIGENTE E AUTOMÁTICA PARA ADMIN
    console.log(`🔓 Iniciando descriptografia automática de ${users.length} usuários para admin...`);
    
    // Usar a função inteligente de descriptografia para admin
    const decryptedUsers = decryptUsersForAdmin(users).map((user: any) => {
      return {
        id: user.id,
        uuid: user.user_uuid, // Incluir UUID para maior segurança
        name: user.name || 'Nome não informado',
        email: user.email || 'Email não informado',
        phone: user.phone,
        address: user.address,
        role: user.is_admin ? 'admin' : 'user',
        status: user.is_active ? 'active' : 'inactive',
        orderCount: parseInt(user.orderCount) || 0,
        totalSpent: parseFloat(user.totalSpent) || 0,
        lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : null,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        // Metadados de descriptografia (apenas para debug em desenvolvimento)
        _decryption_status: user._decryption_status,
        _decrypted_at: user._decrypted_at
      };
    });
    
    console.log(`✅ Descriptografia automática concluída com sucesso!`);

    return NextResponse.json({
      success: true,
      data: {
        users: decryptedUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Método não implementado' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}