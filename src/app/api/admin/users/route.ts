import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const take = parseInt(searchParams.get('take') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';

    const skip = (page - 1) * take;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.is_active = status === 'active';
    }

    if (role) {
      where.is_admin = role === 'admin';
    }

    // Buscar usuários com contagem de pedidos e valor total gasto
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        is_admin: true,
        is_active: true,
        email_verified_at: true,
        last_login: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          select: {
            total_amount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    // Contar total de usuários para paginação
    const totalUsers = await prisma.user.count({ where });

    // Formatar dados dos usuários
    const formattedUsers = users.map((user: any) => {
      const totalSpent = user.orders.reduce((sum: number, order: any) => {
        return sum + Number(order.total_amount || 0);
      }, 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.is_admin ? 'admin' : 'user',
        status: user.is_active ? 'active' : 'inactive',
        emailVerified: !!user.email_verified_at,
        lastLogin: user.last_login ? user.last_login.toLocaleDateString('pt-BR') : 'Nunca',
        createdAt: user.createdAt.toLocaleDateString('pt-BR'),
        orderCount: user._count.orders,
        totalSpent: Math.round(totalSpent * 100) / 100
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          take,
          total: totalUsers,
          pages: Math.ceil(totalUsers / take)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



