import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, isAdmin } from '@/lib/auth';
import { decryptSingleUserForAdmin } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        birth_date: true,
        gender: true,
        is_admin: true,
        is_active: true,
        email_verified_at: true,
        last_login: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true
          }
        },
        orders: {
          select: {
            id: true,
            order_number: true,
            total_amount: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        addresses: {
          select: {
            id: true,
            street: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
            zip_code: true,
            is_default: true
          }
        }
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // DESCRIPTOGRAFIA INTELIGENTE E AUTOMÁTICA PARA ADMIN
    console.log(`🔓 Descriptografando usuário ${targetUser.id} para visualização detalhada do admin...`);
    const decryptedUser = decryptSingleUserForAdmin(targetUser);
    
    // Formatar dados do usuário (já descriptografados)
    const formattedUser = {
      id: decryptedUser.id,
      uuid: decryptedUser.user_uuid, // Incluir UUID para maior segurança
      name: decryptedUser.name,
      email: decryptedUser.email,
      phone: decryptedUser.phone || '',
      cpf: decryptedUser.cpf || '',
      birth_date: decryptedUser.birth_date,
      gender: decryptedUser.gender,
      is_admin: decryptedUser.is_admin,
      is_active: decryptedUser.is_active,
      email_verified: !!decryptedUser.email_verified_at,
      last_login: decryptedUser.last_login,
      createdAt: decryptedUser.createdAt,
      updatedAt: decryptedUser.updatedAt,
      stats: {
        total_orders: decryptedUser._count.orders,
        total_addresses: decryptedUser._count.addresses
      },
      recent_orders: decryptedUser.orders.map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        total_amount: Number(order.total_amount),
        status: order.status,
        createdAt: order.createdAt
      })),
      addresses: decryptedUser.addresses,
      // Metadados de descriptografia (apenas para debug em desenvolvimento)
      _admin_decryption: decryptedUser._admin_decryption
    };

    return NextResponse.json({
      success: true,
      data: formattedUser
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      cpf, 
      birth_date, 
      gender, 
      is_admin, 
      is_active 
    } = body;

    // Validar campos obrigatórios
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe para outro usuário
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Este email já está em uso por outro usuário' },
        { status: 400 }
      );
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone: phone || null,
        cpf: cpf || null,
        birth_date: birth_date ? new Date(birth_date) : null,
        gender: gender || null,
        is_admin: Boolean(is_admin),
        is_active: Boolean(is_active),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem pedidos
    const userWithOrders = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!userWithOrders) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (userWithOrders._count.orders > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível excluir usuário com pedidos. Use desativação em vez de exclusão.' },
        { status: 400 }
      );
    }

    // Excluir o usuário
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



