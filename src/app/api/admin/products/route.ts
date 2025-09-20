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
        { name: { contains: search } },
        { sku: { contains: search } }
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
    
    // Validar campos obrigatórios
    if (!body.name || !body.price || !body.brand_id || !body.model_id) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: nome, preço, marca e modelo'
      }, { status: 400 });
    }

    // Gerar slug único
    let baseSlug = body.slug || body.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Verificar se slug já existe e criar versão única
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Verificar se SKU já existe (se fornecido)
    if (body.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: body.sku } });
      if (existingSku) {
        return NextResponse.json({
          success: false,
          error: 'SKU já existe. Escolha um SKU único.'
        }, { status: 400 });
      }
    }

    // Criar produto sem model_id primeiro
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: slug,
        description: body.description || null,
        short_description: body.short_description || null,
        sku: body.sku || null,
        price: parseFloat(body.price),
        original_price: body.original_price ? parseFloat(body.original_price) : null,
        cost_price: body.cost_price ? parseFloat(body.cost_price) : null,
        stock_quantity: parseInt(body.stock_quantity) || 0,
        min_stock_level: parseInt(body.min_stock_level) || 5,
        weight: body.weight ? parseFloat(body.weight) : null,
        dimensions_length: body.dimensions_length ? parseFloat(body.dimensions_length) : null,
        dimensions_width: body.dimensions_width ? parseFloat(body.dimensions_width) : null,
        dimensions_height: body.dimensions_height ? parseFloat(body.dimensions_height) : null,
        color: body.color || null,
        color_hex: body.color_hex || null,
        care_instructions: body.care_instructions || null,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
        brand_id: parseInt(body.brand_id),
        categoryId: 1, // Categoria padrão (pode ser ajustada conforme necessário)
        is_active: body.is_active !== undefined ? body.is_active : true,
        is_featured: body.is_featured || false,
        is_new: body.is_new || false,
        is_bestseller: body.is_bestseller || false
      },
      include: {
        brands: true,
        category: true
      }
    })

    // Atualizar com model_id se fornecido usando SQL direto
    if (body.model_id) {
      await prisma.$executeRaw`
        UPDATE products 
        SET model_id = ${parseInt(body.model_id)} 
        WHERE id = ${product.id}
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Produto criado com sucesso',
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
