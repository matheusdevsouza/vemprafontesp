import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { authenticateUser } from '@/lib/auth';
import { decryptFromDatabase } from '@/lib/transparent-encryption';

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
    
    const users = await database.query(`
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
    `, [...params, limit.toString(), offset.toString()]);

    // Contar total de usuários para paginação
    const totalResult = await database.query(`
      SELECT COUNT(*) as total FROM users 
      ${whereClause}
    `, params);
    
    const totalUsers = totalResult[0].total;

    // Descriptografar dados de todos os usuários
    const decryptedUsers = users.map((user: any) => {
      const decryptedUser = decryptFromDatabase('users', user);
      return {
        id: decryptedUser.id,
        name: decryptedUser.name || 'Nome não informado',
        email: decryptedUser.email || 'Email não informado',
        phone: decryptedUser.phone,
        address: decryptedUser.address,
        role: decryptedUser.is_admin ? 'admin' : 'user',
        status: decryptedUser.is_active ? 'active' : 'inactive',
        orderCount: parseInt(user.orderCount) || 0,
        totalSpent: parseFloat(user.totalSpent) || 0,
        lastLogin: decryptedUser.last_login ? new Date(decryptedUser.last_login).toLocaleDateString('pt-BR') : null,
        createdAt: decryptedUser.created_at,
        updatedAt: decryptedUser.updated_at
      };
    });

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