import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { authenticateUser, isAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'all') {
      where.categoryId = parseInt(category);
    }

    if (brand && brand !== 'all') {
      where.brand_id = parseInt(brand);
    }

    // Construir ordenação
    const orderBy: any = {};
    if (sortBy === 'name') orderBy.name = sortOrder;
    else if (sortBy === 'price') orderBy.price = sortOrder;
    else if (sortBy === 'stock') orderBy.stock_quantity = sortOrder;
    else if (sortBy === 'brand') orderBy.brands = { name: sortOrder };
    else if (sortBy === 'category') orderBy.category = { name: sortOrder };
    else orderBy.createdAt = sortOrder;

    const products = await prisma.product.findMany({
      where,
      include: {
        brands: true,
        category: true,
        product_images: {
          where: { is_primary: true },
          take: 1
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Contar total de produtos
    const total = await prisma.product.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: {
        products: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      }
    }, { status: 500 })
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

    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: body.description,
        price: parseFloat(body.price),
        stock_quantity: parseInt(body.stock),
        brand_id: parseInt(body.brand_id),
        categoryId: parseInt(body.category_id),
        is_active: body.is_active !== undefined ? body.is_active : true
      }
    })

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect();
  }
}
