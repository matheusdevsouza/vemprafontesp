import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, isAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissão de admin
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const categories = await prisma.category.findMany({
      where: { is_active: true },
      include: {
        subcategories: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { sort_order: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissão de admin
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const { name, description, image_url, sort_order } = body;

    // Gerar slug único
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image_url,
        sort_order: sort_order ? parseInt(sort_order) : 0
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Categoria criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



